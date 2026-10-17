# Анализ сетевого функционала: .NET Install Tool (ms-dotnettools.vscode-dotnet-runtime) 3.2.0

Цель: подготовка корпоративной сборки с минимальным сетевым функционалом.
Код в анализе не изменялся. Восстановленные из sourcemap исходники лежат в `analysis/sources/`
(бандл `dist/extension.js` минифицирован, но `extension.js.map` содержит полные исходники).

## 1. Что это за расширение

Устанавливает и сопровождает .NET SDK/Runtime, которые используют **другие расширения**
(C#, C# DevKit и т.п.), а также по команде пользователя. Активация — `onStartupFinished`,
т.е. выполняется при каждом запуске VS Code без условий.

Экспортирует API-команды: `dotnet.acquire`, `dotnet.acquireStatus`, `dotnet.acquireGlobalSDK`,
`dotnet.findPath`, `dotnet.availableInstalls`, `dotnet.listVersions`, `dotnet.recommendedVersion`,
`dotnet.uninstall`, `dotnet.uninstallAll`, `dotnet.ensureDotnetDependencies`, `dotnet.forceUpdate`,
`dotnet.showAcquisitionLog`, `dotnet.getAcquisitionLog`, `dotnet.reportIssue`, `dotnet.resetData`.

## 2. Карта сетевых взаимодействий

### 2.1 Телеметрия (Azure Application Insights / Microsoft 1DS)

- Строка подключения зашита в `package.json` → `connectionString`
  (InstrumentationKey + `https://westus2-0.in.applicationinsights.azure.com/` + LiveEndpoint).
- `TelemetryObserver` (`EventStream/TelemetryObserver.js`) через `@vscode/extension-telemetry`
  отправляет **каждое** событие внутреннего EventStream (239 классов событий, 216 уникальных имён
  `eventName`; перепроверено по бандлу — прежняя оценка «43» была ошибочной): тайминги HTTP-запросов
  (включая URL), запросы на установку, ошибки, вывод установочных скриптов (с хэшированными путями),
  версии, архитектуры и пр.
- Резервные эндпоинты внутри SDK: `dc.services.visualstudio.com`, `dc-int.services.visualstudio.com`,
  `mobile.events.data.microsoft.com/OneCollector/1.0` (1DS), `browser.events.data.microsoft.com`,
  `breeze.aimon.applicationinsights.io`.
- Включена по умолчанию. Гейты: `dotnetAcquisitionExtension.enableTelemetry` (default true) И
  глобальная телеметрия VS Code (`telemetry.telemetryLevel` / `vscode.env.isTelemetryEnabled`).
- Дополнительно управляет `DOTNET_CLI_TELEMETRY_OPTOUT` для дочерних процессов .NET.

### 2.2 Проверка «онлайна» (DNS, не HTTP)

`WebRequestWorkerSingleton.isOnline()` (`Utils/WebRequestWorkerSingleton.js`): DNS-резолв
`www.microsoft.com`. Вызывается из:
- `dotnet.acquire` / `dotnet.acquireGlobalSDK` перед каждой установкой;
- `LocalInstallUpdateService.automaticUpdate()` (фоновое автообновление);
- обработчиков таймаутов веб-запросов.
- **`DOTNET_INSTALL_TOOL_OFFLINE=1`** — недокументированный гейт: `isOnline()` всегда `false`.

### 2.3 Разрешение версий (JSON-манифесты Microsoft)

- `https://builds.dotnet.microsoft.com/dotnet/release-metadata/releases-index.json` —
  `VersionResolver` (`dotnet.listVersions`, `dotnet.recommendedVersion`, и ЛЮБАЯ установка
  с неполной версией, напр. `"8.0"` — т.е. типичный запрос от C#-расширения).
- `https://builds.dotnet.microsoft.com/dotnet/release-metadata/{major.minor}/releases.json` —
  `GlobalInstallerResolver` (глобальная установка SDK: версия, URL установщика, хэш).
- Кэш ответов 2 минуты (in-memory axios-cache-interceptor).

### 2.4 Загрузка .NET

- Установочные скрипты: `https://builds.dotnet.microsoft.com/dotnet/scripts/v1/dotnet-install.{ps1,sh}`
  (`InstallScriptAcquisitionWorker`). **Fallback-копии скриптов лежат в самом VSIX**
  (`extension/dist/install scripts/`) — при недоступности сети используется локальная копия.
- Сами скрипты (официальные dotnet-install) качают рантаймы с:
  `builds.dotnet.microsoft.com/dotnet` (основной), `ci.dot.net/public` (fallback).
  (Уточнение: устаревшие хосты `dotnetcli.blob.core.windows.net` и `download.visualstudio.microsoft.com`
  в текущей версии скрипта отсутствуют — первый встречается только в белом списке доменов установщика SDK.)
- Глобальный SDK (Win/macOS): загрузка установщика exe/pkg с доменов из белого списка
  (`download.visualstudio.microsoft.com`, `builds.dotnet.microsoft.com`, `ci.dot.net`,
  `dotnetcli.blob.core.windows.net`) + проверка хэша, запуск с повышением прав
  (`@vscode/sudo-prompt` / запуск exe).
- Linux: установка через пакетный менеджер дистрибутива (см. `distro-data/distro-support.json`,
  читается локально из VSIX): Debian/Ubuntu — apt/dpkg, для них подключается фид
  `packages.microsoft.com` (packages-microsoft-prod.deb); RHEL — dnf, без фида Microsoft.
  Для прочих дистрибутов в терминале выполняется универсальный `install scripts/install-linux-prereqs.sh`
  (apt-get/dpkg/zypper) — сетевая работа системного пакетного менеджера.

### 2.5 Фоновое автообновление локальных рантаймов (`LocalInstallUpdateService`)

- Запускается в `activate()`: через `dotnetAcquisitionExtension.runtimeUpdateDelaySeconds`
  (по умолчанию 300 с) после старта VS Code, далее не чаще раза в 24 часа.
- `automaticUpdate()`: DNS-проверка → для каждой локальной группы рантаймов
  `installAction(..., forceUpdate=true)` → releases-index.json + **загрузка новой версии**
  → удаление устаревших. Полностью фоновая загрузка десятков МБ без действия пользователя.
- Прямой настройки «выключить» нет; `DOTNET_INSTALL_TOOL_OFFLINE=1` фактически отключает
  (ранний выход из `automaticUpdate`).

### 2.6 JsonInstaller — упреждающая установка при старте

- Сканирует package.json всех установленных расширений на поле `x-dotnet-acquire`
  (при старте и при каждой установке/удалении расширений) и сам запускает `dotnet.acquire`
  → полный сетевой цикл загрузки, если у расширения есть такая декларация и нет локальной установки.

### 2.7 AI Language Model Tools (Copilot / agent mode)

- 8 инструментов, включены по умолчанию (`enableLanguageModelTools` default true).
- Сетевые при вызове ИИ: `list_available_dotnet_versions_to_install`,
  `recommended_dotnet_sdk_version` (releases-index.json), `install_dotnet_sdk` (загрузка SDK).

### 2.8 Открытие внешнего браузера (npm `open`)

- Команда `dotnet.reportIssue` → github.com/dotnet/vscode-dotnet-runtime/issues.
- Диалоги ошибок («More information», timeout-help) → страницы GitHub/troubleshooting.
- Это не HTTP из расширения, но открывает внешние URL в браузере пользователя.

### 2.9 Прокси

- Автоопределение (при каждом формировании HTTP-опций): env `HTTP(S)_PROXY` + npm-config +
  реестр Windows `HKCU\...\Internet Settings` (локальные операции, без сети).
- `https-proxy-agent` для запросов через прокси; ручная настройка `proxyUrl`.
- NB: в бандле есть `get-proxy-settings` с тестовым URL `https://www.bing.com/` (валидация
  прокси), но расширение вызывает только `getProxySettings()` без валидирующего запроса —
  bing.com фактически не используется (мёртвый код).

## 3. Что сети НЕ требует (основа корпоративного сценария)

- `dotnetAcquisitionExtension.existingDotnetPath` / `sharedExistingDotnetPath` — использовать
  предустановленный корпоративный .NET (`ExistingPathResolver`, без сети).
- `dotnet.findPath` / `dotnet.availableInstalls` — поиск локальных установок
  (PATH, `DOTNET_ROOT`, Program Files, hostfxr-записи, установки расширения).
- `dotnet.acquire` при уже установленной нужной major.minor: сначала локальные проверки;
  при «офлайн»-ответе (DNS-файл или `DOTNET_INSTALL_TOOL_OFFLINE=1`) возвращается локальная
  установка без обращений к releases-index.json.
- `dotnet.acquireStatus`, `dotnet.uninstall*`, `dotnet.resetData`, просмотр логов.
  Нюансы (перепроверено): `dotnet.acquireStatus` при ОТСУТСТВИИ локальной установки запрошенной
  major.minor делает DNS-проверку и доходит до releases-index.json (разрешение версии);
  `dotnet.uninstall` в API-форме (локальная установка, короткая версия напр. «8.0», без force)
  тоже разрешает версию через releases-index.json. UI-удаление (force) и `uninstallAll` — офлайн.
- Локальные fallback-копии dotnet-install скриптов внутри VSIX.

## 4. Существующие выключатели (без изменения кода)

| Механизм | Что отключает | Надёжность |
|---|---|---|
| `dotnetAcquisitionExtension.enableTelemetry=false` + VS Code `telemetry.telemetryLevel=off` | Телеметрию | Настройка пользователя — может быть изменена обратно |
| `DOTNET_INSTALL_TOOL_OFFLINE=1` (env) | DNS-проверки, фоновое автообновление; переводит acquire на локальные установки | Не документирован; не убирает сами HTTP-попытки при отсутствии локальной версии; телеметрию не трогает |
| `enableLanguageModelTools=false` | AI-инструменты | Настройка пользователя |
| `runtimeUpdateDelaySeconds` | Только задержка автообновления, НЕ отключение | — |
| `enablePreviewFeatures`, `suppressOutput` и пр. | Не сетевые | — |

Вывод: гарантированное отсутствие сетевой активности настройками недостижимо — нужен патч.

## 4.1 Внесённые изменения (корпоративная сборка, 2026-10-17)

Правится распакованный пакет `ms-dotnettools.vscode-dotnet-runtime-3.2.0/`, пересборка — в
`ms-dotnettools.vscode-dotnet-runtime-3.2.0-corporate.vsix` (состав файлов идентичен оригиналу).
Оригинал не тронут. Изменения телеметрии (п.5.1 плана) — выполнено, минимально:

1. `extension/dist/extension.js`: функция `enableExtensionTelemetry` заменена на постоянный
   `return false` («телеметрия расширения всегда выключена»). Это единственная точка принятия
   решения — наблюдатель телеметрии больше никогда не создаётся ни настройкой расширения
   (`enableTelemetry=true` больше не действует), ни общим флагом телеметрии VS Code.
   Побочный (штатный) эффект: ветка `setDotnetSDKTelemetryToMatch` при «выключено» ставит
   `DOTNET_CLI_TELEMETRY_OPTOUT=true` для дочерних процессов .NET (на Windows — `setx`, т.е. на
   уровне пользователя).
2. `extension/dist/extension.js` (вшитая веб-паком копия package.json) и `extension/package.json`:
   строка подключения Application Insights удалена (в бандле заменена на пустую) — восстановить
   отправку невозможно даже правкой внешнего манифеста.
3. `extension/package.json`: `dotnetAcquisitionExtension.enableTelemetry` default `true` → `false`
   (косметика: интерфейс настроек показывает выключенное состояние).

4. Фоновое обновление отключено (п.5.3 плана, 2026-10-17): в `extension/dist/extension.js`
   метод `ManageInstalls` службы обновлений заменён на `return Promise.resolve()`. Это единственный
   вход и для автозапуска из `activate()`, и для команды `dotnet.forceUpdate` — обе не делают ничего.
   Отключены: DNS-проверка перед обновлением, запросы списков версий, фоновая загрузка новых сред
   и удаление устаревших. Настройка `runtimeUpdateDelaySeconds` стала инертной (оставлена в
   манифесте ради минимальности дифа). Ручные установки/удаления не затронуты.
   (Правки 1–4 закоммичены пользователем: 20d0356, 8c06d8e.)

5. Постоянный офлайн без сетевых запросов (п.5.2 плана, 2026-10-17): пять заглушек в
   `extension/dist/extension.js`:
   - `isOnline()` → всегда `false` — DNS-разрешение www.microsoft.com не выполняется никогда
     (эквивалент постоянного `DOTNET_INSTALL_TOOL_OFFLINE=1`, но без зависимости от окружения);
   - `getWithAxiosOrFetch()` → `null` и `getFetchResponse()` → `null` — единственные две точки,
     где расширение создавало HTTP-запросы (axios и fetch); все вызывающие теперь мгновенно
     получают «пусто»: команды списка/разрешения версий штатно падают с ошибкой
     «Unable to connect to the index server», без попыток соединения и таймаутов;
   - `downloadFile()` → сразу бросает ошибку — загрузка установщика SDK не начинается;
   - офлайн-поиск локальной установки (бывшая функция предупреждения): если подходящей локальной
     установки нет, `dotnet.acquire`/`acquireGlobalSDK`/`acquireStatus` немедленно завершаются
     ошибкой «offline mode: network access is disabled... Configure existingDotnetPath» вместо
     предупреждения в журнал и продолжения к загрузкам. Установочный сценарий при этом даже не
     запускается — дочерние процессы (curl/PowerShell сценария установки) до сети не доходят.
   Итоговое поведение: existingDotnetPath/sharedExistingDotnetPath или имеющаяся локальная
   установка расширения возвращаются без сети; любая попытка чего-то ещё — быстрый отказ
   с понятным сообщением. Телеметрия к этому моменту уже отключена (пп.1–3), так что сведения
   об этих ошибках никуда не отправляются.

Замечание: сам код модуля `@vscode/extension-telemetry` остаётся в бандле как мёртвый — он
исполняется только из конструктора наблюдателя, который больше не вызывается.


## 5. Рекомендации для корпоративной сборки

Надёжный путь — сборка из открытых исходников (github.com/dotnet/vscode-dotnet-runtime) с патчами
либо точечный патч минифицированного `dist/extension.js` (по sourcemap) с перепаковкой VSIX.

Приоритетный список изменений («нулевая сеть», вариант A — предустановленный .NET):

1. **Телеметрия**: удалить `connectionString` из `package.json` и/или не создавать
   `TelemetryObserver` в `registerEventStream` (`EventStreamRegistration.js`); дефолт
   `dotnetAcquisitionExtension.enableTelemetry` → `false`.
2. **HTTP-слой**: заставить `WebRequestWorkerSingleton.isOnline()` всегда возвращать `false`
   (эквивалент постоянного `DOTNET_INSTALL_TOOL_OFFLINE=1`) и/или заглушить
   `makeWebRequest`/`downloadFile`. Это отключает: DNS-проверки, автообновление,
   обращения к releases-index.json (при наличии локальной установки), загрузки.
3. **Автообновление**: не вызывать `automaticUpdater.ManageInstalls(...)` в `activate()`
   (`extension.ts`) — дублирует п.2, но явнее.
4. **JsonInstaller**: не создавать в `activate()` (иначе любая установка расширения с
   `x-dotnet-acquire` попытается качать .NET).
5. **AI-инструменты**: `enableLanguageModelTools` default → `false` или не регистрировать.
6. Опционально: убрать вызовы `open()` (`reportIssue`, «More info») — остаются офлайн-ссылки.
7. Выставить в корпоративной политике `existingDotnetPath`/`sharedExistingDotnetPath` на
   предустановленный .NET — рабочий сценарий без сети для C# и зависимых расширений.

Вариант B (внутреннее зеркало): вместо глушилок заменить базовые URL
(`builds.dotnet.microsoft.com` → внутренний хост) в `VersionResolver.releasesUrl`,
`InstallScriptAcquisitionWorker.scriptAcquisitionUrl`, `GlobalInstallerResolver.getIndexUrl`,
белом списке доменов, в `dist/install scripts/*` (переменные скриптов) — загрузка .NET идёт
из внутренней инфраструктуры, телеметрию всё равно вырезать по п.1.

Замечания:
- VSIX криптографически не подписан — перепаковка допустима для внутреннего распространения
  (политика маркетплейса на внутренние каналы не распространяется).
- Расширение открытое (MIT), сборка из исходников воспроизводима (`npm run compile-all` + webpack).
- `analysis/sources/` содержит восстановленные исходники для навигации по патчам.

## 6. Ключевые точки в восстановленных исходниках

| Функция | Файл (analysis/sources/) |
|---|---|
| Точка входа, автозапуск задач | `vscode-dotnet-runtime-extension/src/extension.ts` |
| Телеметрия: наблюдатель | `vscode-dotnet-runtime-library/dist/EventStream/TelemetryObserver.js` |
| Телеметрия: регистрация/гейты | `vscode-dotnet-runtime-library/dist/EventStream/EventStreamRegistration.js` |
| HTTP-клиент (axios+fetch), isOnline, прокси, downloadFile | `vscode-dotnet-runtime-library/dist/Utils/WebRequestWorkerSingleton.js` |
| releases-index.json | `vscode-dotnet-runtime-library/dist/Acquisition/VersionResolver.js` |
| releases.json + белый список доменов | `vscode-dotnet-runtime-library/dist/Acquisition/GlobalInstallerResolver.js` |
| Загрузка dotnet-install скриптов + fallback | `vscode-dotnet-runtime-library/dist/Acquisition/InstallScriptAcquisitionWorker.js` |
| Фоновое автообновление | `vscode-dotnet-runtime-library/dist/Acquisition/LocalInstallUpdateService.js` |
| Упреждающая установка (x-dotnet-acquire) | `vscode-dotnet-runtime-library/dist/Acquisition/JsonInstaller.js` |
| Глобальный SDK Win/macOS | `vscode-dotnet-runtime-library/dist/Acquisition/WinMacGlobalInstaller.js` |
| Открытие браузера (open) | `vscode-dotnet-runtime-library/dist/Utils/ErrorHandler.js`, `extension.ts` |
| AI-инструменты | `vscode-dotnet-runtime-extension/src/LanguageModelTools.ts` |
