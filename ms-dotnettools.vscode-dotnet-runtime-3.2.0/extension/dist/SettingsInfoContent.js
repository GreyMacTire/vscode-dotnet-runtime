"use strict";
/*---------------------------------------------------------------------------------------------
*  Licensed to the .NET Foundation under one or more agreements.
*  The .NET Foundation licenses this file to you under the MIT license.
*--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsInfoContent = void 0;
/**
 * Comprehensive information for the AI agent about the .NET Install Tool extension.
 * This explains settings, architecture, installation types, and useful tricks.
 *
 * Extracted into its own file to keep LanguageModelTools.ts focused on tool logic.
 */
exports.settingsInfoContent = `
# .NET Install Tool - Guide

## Overview
The .NET Install Tool is a VS Code extension that manages .NET installations. It serves two distinct purposes:
1. **For VS Code Extensions**: Automatically installs .NET runtimes that other extensions (C#, C# DevKit, Unity, Bicep, etc.) need to run their internal components
2. **For Users**: Provides commands to find and install .NET SDKs system-wide for development

---

## Installation Types

### LOCAL (Extension-Managed) Runtime Installs
- Small, isolated .NET runtime installs stored in VS Code's extension data folder
- NOT on the system PATH, NOT visible via \`dotnet --list-runtimes\`
- Used solely by VS Code extensions to run their internal components
- Auto-managed; users rarely need to interact with these
- The extension's uninstall list ONLY shows these local installs for runtimes

### GLOBAL/Admin SDK Installs (system-wide)
- System-wide .NET SDK installs (includes runtimes)
- Typical Locations: Windows: \`%ProgramFiles%\\dotnet\` (admin required) | macOS: \`/usr/local/share/dotnet\` (.pkg) | Linux: \`/usr/lib/dotnet\` or \`/usr/share/dotnet\` (package manager; officially supported: Ubuntu + RHEL; community distros may work; WSL is not supported)

- Requires administrator/sudo privileges; users must accept elevation prompts
- IS on the system PATH after installation
- Visible via \`dotnet --list-sdks\` and \`dotnet --list-runtimes\`
- Use "Install .NET SDK System-Wide" command for this

---

## existingDotnetPath Setting (Commonly Misunderstood)

### What It Does
Controls which .NET runtime VS Code **extensions** use to run their internal components.

### What It Does NOT Do
- Does NOT change what .NET the user's code runs on
- Does NOT affect \`dotnet build\` or \`dotnet run\` commands
- Does NOT change a project's target framework

### When Users Need This
- Extensions fail to start with "could not find .NET runtime" errors
- Corporate/restricted environments where the extension cannot auto-download .NET
- Air-gapped machines without internet or PowerShell script execution restrictions
- User wants extensions to use a specific pre-installed .NET version

**IMPORTANT:** If a user wants to pin which SDK their PROJECT uses (for \`dotnet build\`, \`dotnet run\`, etc.), existingDotnetPath is the WRONG setting. They should use \`global.json\` instead — see the "I want to use a local/repo-specific SDK" scenario below.

Setting names and formats:
- \`dotnetAcquisitionExtension.existingDotnetPath\` — per-extension:
\`\`\`json
[{ "extensionId": "ms-dotnettools.csharp", "path": "C:\\\\Program Files\\\\dotnet\\\\dotnet.exe" }]
\`\`\`
- \`dotnetAcquisitionExtension.sharedExistingDotnetPath\` — all extensions:
\`\`\`json
"C:\\\\Program Files\\\\dotnet\\\\dotnet.exe"
\`\`\`

---

## How to See What's Installed

**Extension-Managed Local Installs:** Run the "Uninstall .NET" command — the dropdown shows all extension-managed installs.

**System-Wide Global Installs:** Run \`dotnet --list-sdks\` and \`dotnet --list-runtimes\` in terminal, or use the listInstalledVersions tool.

**listInstalledVersions Tool:** Calls \`dotnet.availableInstalls\` to scan SDKs/runtimes for a given dotnet executable. If no path provided, it uses PATH (typically global install). Returns version, architecture, and directory for each install.

---

## Uninstall Notes

- The uninstall list only shows extension-managed installs, not system-wide ones
- **Trick:** To uninstall a global SDK not in the list, first install the SAME version via the extension (this registers it), then it appears in the uninstall list
- Global SDK uninstall requires the same admin/elevated privileges as installing

---

## Version Selection

Check \`global.json\` first — if present, install \`sdk.version\` (respecting rollForward). Otherwise, latest LTS.

SDK and runtime share major.minor but differ in patch:

| SDK     | Includes Runtime |
|---------|-----------------|
| 8.0.100 | 8.0.0           |
| 8.0.204 | 8.0.4           |

Installing an SDK always includes the corresponding runtime.

---

## global.json paths (.NET 10+)

For repo-local SDK resolution, use the \`paths\` property in global.json:
\`\`\`json
{
  "sdk": {
    "version": "10.0.100",
    "paths": [".dotnet", "$host$"]
  }
}
\`\`\`
- First matching SDK wins
- Only works with SDK commands (\`dotnet run\`, \`dotnet build\`), NOT with native apphost
- The host \`dotnet\` must be .NET 10+
- Ref: https://learn.microsoft.com/dotnet/core/tools/global-json#paths

---

## Common Scenarios

- **"I want to develop .NET applications"** - Install an SDK globally via "Install .NET SDK System-Wide." This provides the \`dotnet\` CLI for build, run, test, and publish.
- **"I want a local/repo-specific SDK (not global)"** - Use the \`paths\` property in global.json (.NET 10+ required) — see section above. DO NOT use existingDotnetPath.
- **"C# extension won't start / can't find .NET"** → Check \`dotnet --info\` in terminal. If missing, install SDK globally. If a RUNTIME is installed but not detected, set existingDotnetPath or sharedExistingDotnetPath.
- **"Extension installed .NET but I can't use it in terminal"** - Extension-managed runtimes are LOCAL and not on PATH. For terminal/CLI usage, install globally.
- **"I want to use a different .NET version for my project"** - NOT existingDotnetPath. Create \`global.json\` in the project root or install the desired SDK globally.
- **"Which dotnet does the C# extension use?"** - Use the findDotNetPath tool. It searches in order: existingDotnetPath setting - PATH - DOTNET_ROOT - extension-managed local installs.

---

## Additional Settings

- **installTimeoutValue**: Seconds to wait for downloads (default: 600). Increase for slow connections.
- **proxyUrl**: HTTP proxy URL for corporate firewalls.

---

## .NET Hives Architecture
.NET supports multiple installation "hives" (locations). Extension-managed local installs do not conflict with global system installs.
- The \`dotnet\` executable typically only sees installs in its own folder
- \`dotnet.findPath\` shows which hive extensions like C# DevKit will use
- \`dotnet.availableInstalls\` lists installs in a specific hive when given an executable path
`;
//# sourceMappingURL=SettingsInfoContent.js.map
// SIG // Begin signature block
// SIG // MIIpZwYJKoZIhvcNAQcCoIIpWDCCKVQCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 7nMqSGwZslPefCM2xYqey8hN3lZdgIReehAuWjGchRag
// SIG // gg3WMIIGvTCCBKWgAwIBAgITMwAAABxIn4HfobC3dwAA
// SIG // AAAAHDANBgkqhkiG9w0BAQwFADCBiDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJvb3Qg
// SIG // Q2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMjQw
// SIG // ODA4MjEzNjIzWhcNMzUwNjIzMjIwNDAxWjBfMQswCQYD
// SIG // VQQGEwJVUzEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMTAwLgYDVQQDEydNaWNyb3NvZnQgV2luZG93
// SIG // cyBDb2RlIFNpZ25pbmcgUENBIDIwMjQwggIiMA0GCSqG
// SIG // SIb3DQEBAQUAA4ICDwAwggIKAoICAQCafWt9J8F2Ki6u
// SIG // 49U0/8wrbe78VPggo/uwZIn0vwdoFyhlOzlfUl0SRj9c
// SIG // hbOaeo6bGIuHGMxeegFdABJphI1fME9pbz1OQYTd8Fd9
// SIG // B6mDyGBI+T91l39JFw/X741H9RgLVxK4ifMOwCzWlRJv
// SIG // UbOHjwNGbGB2gm1OZAVCUA17++oWnznEIHRQgNyN82LX
// SIG // 819rzsMfO7gzmgrsijkWYofXN803/kywuUGC8oVTAZw1
// SIG // xBwzq72sPdg0siKqXYEVqbn86gxctXoFY5KF2YW/vaWf
// SIG // YXlMzV014TqF83sYemMwC+H5QVpvgXNYUMhEnpxLwSc5
// SIG // 1ftubt4e+444DFGOOPll0OLvanXQ3v1OUngGikb74m5o
// SIG // uM+0EaS72bJWtAj4jlBs9NA6ObH5AtBMJbEs3zN/vAPa
// SIG // 7MhVToFg1T87ffDiT9hKGhDqvBhPRgqDdou/+AthQsH3
// SIG // 9QUgkyVmTtVnK9jLXiROlMRlfooQPJzedWDyg9nWBqHs
// SIG // K170cwv9R6FHkr5WX9Jn/RhxLb75GyVUUaOjwX9Jnebf
// SIG // O1W9ZjP3yKdXsqcmsZl5IKXAcLspbDqtpElTiecAT6Gh
// SIG // LLCZHjHCpxLrrvvlCnQx5UtA7bGIzdEJzrnL03UrHb4c
// SIG // yjkoyRd11aq/X9gveOS10+a8SiB1CBAwXDWFOgSgwx+q
// SIG // 36SjjgkopQIDAQABo4IBRjCCAUIwDgYDVR0PAQH/BAQD
// SIG // AgGGMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBQe
// SIG // gt8O14yz1wI0gw7aq61lua+47DAZBgkrBgEEAYI3FAIE
// SIG // DB4KAFMAdQBiAEMAQTAPBgNVHRMBAf8EBTADAQH/MB8G
// SIG // A1UdIwQYMBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYG
// SIG // A1UdHwRPME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0Nl
// SIG // ckF1dF8yMDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQRO
// SIG // MEwwSgYIKwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3J0MA0GCSqGSIb3DQEBDAUAA4ICAQBD
// SIG // X/jfP7vplIw7XPW7aAOdkQXNF1Q0gTEATKsbueoVxwcL
// SIG // nLVFrNVwagwzCBQh7vXOmP1BfkzfBCII57owKSmJhz+H
// SIG // +BDNwEUppc66ReaMzicdAQORVL9Y5qXX/9mW6qbwsZcb
// SIG // /xtUeCo60ppqjx87OooMN2+0U24+wcSEvHziJMGFkIQd
// SIG // ny45YPtx0qwxjxSIaSCVlWpjCEe2u9jhqJ43X+Oa7KcK
// SIG // iB7sp2VOGr8va7gf0YYW8JvnzG/ATHnCGk5pKIcfxGWe
// SIG // RjVnDeqE2FtxtgTNwd2M51pJfbeLIT+tHzLnvtpLHRxl
// SIG // khPBFU3UphlHY9I61HOOpRlRSSEhd/zMXMZ5TXj9Socq
// SIG // /mc0+BLbPyO5rn6Wi5y2pczEdsyLoRjgFlrMHrG47Rc5
// SIG // FVBYA0dklvdNyNFypWzxAOqvHqRxifa6MYfOZ7BCnATV
// SIG // MOEnKevCgqkqRQWiosldbJHfpfFOdFjXjzG/Qc89DnwE
// SIG // mpfL+bEBvg1tNZDfiPkSlCGzOSOdMCY4h8pkBTQ7G6Gx
// SIG // cfSPeZghBD1O31Gd1U/xzlFW5Jl+5bSAv3kALuRjvH7v
// SIG // nHhEzMm726MVDOHWDQvj86KFMX5gtA7ikcAdtW1/fmnL
// SIG // iAZMSJuBHdztfcNVS6AO1DTlLie8+jUNlv/qu3J3zj5d
// SIG // kFS+KpYAm5VE9r5kKZZVdzCCBxEwggT5oAMCAQICEzMA
// SIG // AAFKYA0QQJT2ZqAAAAAAAUowDQYJKoZIhvcNAQEMBQAw
// SIG // XzELMAkGA1UEBhMCVVMxHjAcBgNVBAoTFU1pY3Jvc29m
// SIG // dCBDb3Jwb3JhdGlvbjEwMC4GA1UEAxMnTWljcm9zb2Z0
// SIG // IFdpbmRvd3MgQ29kZSBTaWduaW5nIFBDQSAyMDI0MB4X
// SIG // DTI2MDMxMjE4MjcxOVoXDTI3MDMwMzE4MjcxOVowdDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEeMBwGA1UEAxMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMIICIjANBgkqhkiG9w0BAQEF
// SIG // AAOCAg8AMIICCgKCAgEAymkDK2qRquXCO/Ul9oq3Gj+G
// SIG // MVgy89I6z2HOyApy8qCwdXl2COgzAFDZzVObw5+wdIkX
// SIG // Axnnkl+J4ug0q9kjDRWjHWpu2fmtJmbwdNKlKLTTxvt5
// SIG // YpWHig+mjZiAurJ1YHAfndqRjn/yaVeGHXpJcWvHrGE7
// SIG // NLcq11ZlxIrp1E1XnWc+XVx9C0UdhbyLdVxOhpcqc5Q/
// SIG // enCqtjgYGqcwC3W0bVFsSP+qDVtqHDNfqKDoO5HY+3Pf
// SIG // 8qcooM9bxsuJR2l92eEDN+IGRCxQQ0b3AWxyXsMSdLOT
// SIG // 1FLut7fUXwW4CszWIHHdyitCbXl75C1hBbM+sOCWuqjy
// SIG // cSj+egoSbGUo2iT+2uwNxkK2fJPGhr163N7fzE9x0Aww
// SIG // hejen54ToaV7NnfITsx9k+UTVdn7TtAe75NP6lzZaS8a
// SIG // TN9yfEf9EDZUrwth/Hs5ne2VeCVc/UjWs9JrjLH3gyZ3
// SIG // nyKRpe8RjzjzQ/7itwZoMqUFaheT2C2avWreSIXiNK2U
// SIG // 6ccuax62SeKD4xodEt/Q35IL7kw0F6j5/SHKUCRD+qpr
// SIG // aLIsoZGjIJVO5JpuurfhbSfrrRjgbnw9kaPmpSOpkHm4
// SIG // hA0H4ON2tIJQMtA552Q851IUIHBFusqdK7QLXKj5B5B7
// SIG // /vu1KmIFGAqwbC94lf0tABMoBIawKcn/KIhUoWAmRZkC
// SIG // AwEAAaOCAa8wggGrMA4GA1UdDwEB/wQEAwIHgDAfBgNV
// SIG // HSUEGDAWBgorBgEEAYI3PQYBBggrBgEFBQcDAzAMBgNV
// SIG // HRMBAf8EAjAAMB0GA1UdDgQWBBSuBtPQTiZNqkexSNvY
// SIG // /ErRKBN4+zBFBgNVHREEPjA8pDowODEeMBwGA1UECxMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMRYwFAYDVQQFEw01
// SIG // MDExNTArNTA3NDMwMB8GA1UdIwQYMBaAFB6C3w7XjLPX
// SIG // AjSDDtqrrWW5r7jsMGoGA1UdHwRjMGEwX6BdoFuGWWh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY3Js
// SIG // L01pY3Jvc29mdCUyMFdpbmRvd3MlMjBDb2RlJTIwU2ln
// SIG // bmluZyUyMFBDQSUyMDIwMjQuY3JsMHcGCCsGAQUFBwEB
// SIG // BGswaTBnBggrBgEFBQcwAoZbaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3NvZnQl
// SIG // MjBXaW5kb3dzJTIwQ29kZSUyMFNpZ25pbmclMjBQQ0El
// SIG // MjAyMDI0LmNydDANBgkqhkiG9w0BAQwFAAOCAgEAkWQ7
// SIG // 8vtUKO27btUfmwBc7nQOJ5go8j8P1s0B3vbrbWdexqOf
// SIG // DD6GsC8yG+9Uq4dOsYf6U6f+WUL2DVl59PCjgI+PQR2R
// SIG // dlDue4o2BEqFayQzLrOqo0dRzQKhxQdk/csPiYHuHJZ1
// SIG // vwQPGQMivoE+pxThGQvbQVtYmdtvSwzpmKSvH/mySRLh
// SIG // 0Vf3n7lb/a06TMwVwr5nueGJ6MNLqn3JKRxAueCHQgKO
// SIG // poosis20f/dkuOQG5Nl1jokPX+0bfga6XHC/tAnByu4/
// SIG // KH5uLg4ilXSo1MofpNJb7K7ytWTSIm1ikA7KvO3yNSPz
// SIG // JkVzLHALS9K5REilpT/wHr9peYdRVFbA2oXmOtwbV13b
// SIG // mcAilZ7IKsJoc7ba875DgTk6u3vwfwf/UzYB8Umwj/7n
// SIG // jtJN7tSIHzsG5POGJaJ6FHIU/zE75tUIOVaBuYYtCt7d
// SIG // VHwVfWcLQ8b467qisMe8RJ+B0vA0+zSB+EvGaUeSmZHX
// SIG // 9pdcfp9GMkJBwwhk1Sh5TCNVpGVLauV/4LQZBV8gIv3X
// SIG // kJQ98ROjRrREmhObjVIAnKVNAEIFKv8XeZW/CJ1jRok7
// SIG // 26g4rdZ1CQxTLIlL20sB38jugSGNfSfVQyjgEJQ0KzQy
// SIG // kkVkb8V4VewaZ0Ogmf7fUsJRFoEkAJsyeBQhMQzobS7+
// SIG // nDeuZzd68WyAaXWH0FIxghrpMIIa5QIBATB2MF8xCzAJ
// SIG // BgNVBAYTAlVTMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xMDAuBgNVBAMTJ01pY3Jvc29mdCBXaW5k
// SIG // b3dzIENvZGUgU2lnbmluZyBQQ0EgMjAyNAITMwAAAUpg
// SIG // DRBAlPZmoAAAAAABSjANBglghkgBZQMEAgEFAKCBrjAZ
// SIG // BgkqhkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgorBgEE
// SIG // AYI3AgELMQ4wDAYKKwYBBAGCNwIBFTAvBgkqhkiG9w0B
// SIG // CQQxIgQgeCPjuxYbrqhR0TDXv6N2yj7/VOcZppQSSc8j
// SIG // cIVxwVgwQgYKKwYBBAGCNwIBDDE0MDKgFIASAE0AaQBj
// SIG // AHIAbwBzAG8AZgB0oRqAGGh0dHA6Ly93d3cubWljcm9z
// SIG // b2Z0LmNvbTANBgkqhkiG9w0BAQEFAASCAgAR+DhIM7Sd
// SIG // /LdJdnAdozAhKM2jhEtgGOmeo85mTZ+RiBPyd1zJ8r55
// SIG // 157sZ/gSiLo29BW9q7MkB7Ik4dLp3H4r/PIJ850SXii2
// SIG // /n83tAXehZknCYl4QhneHrUc8w1sPBPdR7N0NVkpG+ND
// SIG // 4u/tWBfWdLZsUDUzhvb4DWDzUUzIrNnhWUkIgalFFBon
// SIG // nSORa3aqJDFbbfpus7LqdpBUogtSanGeZF1GH673Wkf3
// SIG // +Qisni3fWFOzGSfWqJ+2+BzVjPSCyo1aqFpMEUCaMg1n
// SIG // N7QxaIv9ywHHMzV1aK6yqTjoluiZCilZxO7y5GSLTeSx
// SIG // 6M6+f1bt1IM4dwxOKKbg4BDffisNBBVEXes2rqG196eq
// SIG // SHfdZlP1stCk/RU7nXV2MNqasqRnR/eQgZZ52wTnj941
// SIG // bJTWEPLa9LX0hOc7PqI31Q5GyIwgPPYKUM0wPrGtzvsE
// SIG // nYS8Voa5fkjlIcOFl2tTbK4cu8iA4NiHLkl8EdpgJ1Wn
// SIG // DEv3UXlvKrOiF/pYFXMxwTq2ZWqKNVzGOCCqlXOY8PHr
// SIG // gDcyBqRg7cd4Ag1Adfgjl96kS2CEZLdEL3OKPEjHXgGB
// SIG // 8lsSKO5GKeug1+mAoX1lILyLmdPsMj6ruh232ImsXq5B
// SIG // r1JXcMQ4w6wafWUcigO2feXJg5V5R+0qv6jCiEme+OZz
// SIG // 7MFLYoSza9F7x6GCF5MwghePBgorBgEEAYI3AwMBMYIX
// SIG // fzCCF3sGCSqGSIb3DQEHAqCCF2wwghdoAgEDMQ8wDQYJ
// SIG // YIZIAWUDBAIBBQAwggFRBgsqhkiG9w0BCRABBKCCAUAE
// SIG // ggE8MIIBOAIBAQYKKwYBBAGEWQoDATAxMA0GCWCGSAFl
// SIG // AwQCAQUABCDS+VnfoasnH33/pND/1JbIp8ZBzF0TSeNf
// SIG // h+ofOUxohgIGaqpJHvRmGBIyMDI2MDkxNjIzNTAzMy4x
// SIG // OVowBIACAfSggdGkgc4wgcsxCzAJBgNVBAYTAlVTMRMw
// SIG // EQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRt
// SIG // b25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRp
// SIG // b24xJTAjBgNVBAsTHE1pY3Jvc29mdCBBbWVyaWNhIE9w
// SIG // ZXJhdGlvbnMxJzAlBgNVBAsTHm5TaGllbGQgVFNTIEVT
// SIG // TjozNzAzLTA1RTAtRDk0NzElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCEeowggcgMIIF
// SIG // CKADAgECAhMzAAACHzpwaeSiMC6VAAEAAAIfMA0GCSqG
// SIG // SIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAk
// SIG // BgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
// SIG // MDEwMB4XDTI2MDIxOTE5Mzk1MVoXDTI3MDUxNzE5Mzk1
// SIG // MVowgcsxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJTAjBgNVBAsT
// SIG // HE1pY3Jvc29mdCBBbWVyaWNhIE9wZXJhdGlvbnMxJzAl
// SIG // BgNVBAsTHm5TaGllbGQgVFNTIEVTTjozNzAzLTA1RTAt
// SIG // RDk0NzElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIP
// SIG // ADCCAgoCggIBAMs7xcU5x8aoCqCLPT4CZCYWXd1nRpMb
// SIG // hQUmSqo10wfLbwNqF4IGzo425+6TJ7nHjYJaTOBEjL2Q
// SIG // TZVbASe1nxmSDKvKQLRsiqwgPv7oXGC6x5Nd/VXC+bUP
// SIG // zXThWZ62gEmUni4Zu7IllS9cPHnmdWHnTKAtPNnbhaRC
// SIG // yc+m9Fm/aQ9zf1/duEvIdW2cexr9b/zpWt+134B8W94D
// SIG // 6o38Rj5caPlz8M8xcJgQJvRqthv3Z0Mla3DOnIGuniB8
// SIG // eWBjVQSlziXgAYQut/YnjCvFPNNb5IzxeFXV044+tiMP
// SIG // TzQhtmovwH4gXREJ2fbr1hesYrpAgeKnOcplwJLyM3fR
// SIG // gAedMlU3lnOzq3/ZiyoEYOq68Np3v3fgUVPDO9Rw7dWg
// SIG // jJ33ddbC8/z9IIVUmHbVbygZBOm0YfKXL4WXiF6dUxVk
// SIG // XW/qiw62KtfwYVOISGd/ydF06DvJlgAnTHL0K0N9tdpO
// SIG // f9x/curc38YJgoWML7mZQIT4AmGbEy4x29JQaYqIAV2I
// SIG // 8CNROqxZYEFkmbR4LCB4YkWaZAD5Xv/3wEpwT6BQvs71
// SIG // 5ZENDAp4By+jqvE2/ZjiMqscDpn/CLdr98pSEsI1kRLy
// SIG // oZ2ukMCbuqH7oWNjHK0BuSIozq5M3L9Qs+XC2VhmgAkM
// SIG // NA/t5gLLDBVs1NsddEFJL41xwLSxIHhbtTrvAgMBAAGj
// SIG // ggFJMIIBRTAdBgNVHQ4EFgQU2TvawYOUfSvkPC98ZHlf
// SIG // AkjwHtswHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacb
// SIG // UzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3
// SIG // dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9z
// SIG // b2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSku
// SIG // Y3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQ
// SIG // aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9j
// SIG // ZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENB
// SIG // JTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAWBgNV
// SIG // HSUBAf8EDDAKBggrBgEFBQcDCDAOBgNVHQ8BAf8EBAMC
// SIG // B4AwDQYJKoZIhvcNAQELBQADggIBAGVu7cijKec/PQrW
// SIG // I9t42ex6PZvXmXmx2XYUAUEEZP2VF1zaA1XwsAi6w9gc
// SIG // eFS9ENyzHiVsw2FUo8a7hMMtqo238Ij5IW0a6p1EulU/
// SIG // VcT1wIvIqso+lwkUkKo+lX55+gC1gGYhRBzHHBPtYhDu
// SIG // BqDz6uQq+syQKhGopLSYq/wnWwp+Lzn4ba6Fn/VG15JV
// SIG // 1hk5k6P5JvjDOidMJOPsS2Aw38Ffflbl1PN3vAl0Z6li
// SIG // RWLzvV1KsLZOvVkXMBHtLjh2sJZmknqmElptU06w3EUk
// SIG // qBLKS6A4ZbNDfXxGvcxM+DazcGez6lQ9WAyKN3htQ4fY
// SIG // GUSwswzA5yiVNNmqDUdit1jWPGlQAj2KmMFBEg0v87vT
// SIG // ln79/YuM2YlCigJUlVfbhp2lnnX1Kx9rMaipca33Vuao
// SIG // qjR8jT0iXixQeHiKHqumJAMGXIvu+a8J6PBXFh69jipX
// SIG // BNn+jeC+X5HSUXFhL194gzg14bT5awNnuMtyLkwV643C
// SIG // ixBjfPbpeDWiPRT276dxH25NT7EGYnwG2UJ2FDXdE0xf
// SIG // k/6StFg8HdcKn0mbpdo7X33mrfYAhmbWbMEYjrIeW+Jd
// SIG // oQLlPMaI7Ute4+1dlTZf3ehAlsyh7e/z7kI8qtBqUZbJ
// SIG // i6HZrdXWnBuP5bQUSYQU+m7xMj6pg7UghBZRJG8WNe2H
// SIG // k5vTaEwyMIIHcTCCBVmgAwIBAgITMwAAABXF52ueAptJ
// SIG // mQAAAAAAFTANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0IFJv
// SIG // b3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcN
// SIG // MjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgzMjI1WjB8MQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCAiIwDQYJKoZI
// SIG // hvcNAQEBBQADggIPADCCAgoCggIBAOThpkzntHIhC3mi
// SIG // y9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2AX9sSuDivbk+
// SIG // F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYjDLWNE893MsAQ
// SIG // GOhgfWpSg0S3po5GawcU88V29YZQ3MFEyHFcUTE3oAo4
// SIG // bo3t1w/YJlN8OWECesSq/XJprx2rrPY2vjUmZNqYO7oa
// SIG // ezOtgFt+jBAcnVL+tuhiJdxqD89d9P6OU8/W7IVWTe/d
// SIG // vI2k45GPsjksUZzpcGkNyjYtcI4xyDUoveO0hyTD4MmP
// SIG // frVUj9z6BVWYbWg7mka97aSueik3rMvrg0XnRm7KMtXA
// SIG // hjBcTyziYrLNueKNiOSWrAFKu75xqRdbZ2De+JKRHh09
// SIG // /SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZnkXftnIv231f
// SIG // gLrbqn427DZM9ituqBJR6L8FA6PRc6ZNN3SUHDSCD/AQ
// SIG // 8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEzOUyOArxCaC4Q
// SIG // 6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMYctenIPDC+hIK
// SIG // 12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5C4lh8zYGNRiE
// SIG // R9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6bMURHXLvjflS
// SIG // xIUXk8A8FdsaN8cIFRg/eKtFtvUeh17aj54WcmnGrnu3
// SIG // tz5q4i6tAgMBAAGjggHdMIIB2TASBgkrBgEEAYI3FQEE
// SIG // BQIDAQABMCMGCSsGAQQBgjcVAgQWBBQqp1L+ZMSavoKR
// SIG // PEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwrBgEEAYI3TIN9
// SIG // AQEwQTA/BggrBgEFBQcCARYzaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9Eb2NzL1JlcG9zaXRvcnku
// SIG // aHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMIMBkGCSsGAQQB
// SIG // gjcUAgQMHgoAUwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAP
// SIG // BgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFNX2VsuP
// SIG // 6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRPME0wS6BJoEeG
// SIG // RWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNvbS9wa2kvY3Js
// SIG // L3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIz
// SIG // LmNybDBaBggrBgEFBQcBAQROMEwwSgYIKwYBBQUHMAKG
// SIG // Pmh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2kvY2Vy
// SIG // dHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYtMjMuY3J0MA0G
// SIG // CSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3hLB9nATEkW+Ge
// SIG // ckv8qW/qXBS2Pk5HZHixBpOXPTEztTnXwnE2P9pkbHzQ
// SIG // dTltuw8x5MKP+2zRoZQYIu7pZmc6U03dmLq2HnjYNi6c
// SIG // qYJWAAOwBb6J6Gngugnue99qb74py27YP0h1AdkY3m2C
// SIG // DPVtI1TkeFN1JFe53Z/zjj3G82jfZfakVqr3lbYoVSfQ
// SIG // JL1AoL8ZthISEV09J+BAljis9/kpicO8F7BUhUKz/Aye
// SIG // ixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4sa3tuPywJeBTp
// SIG // kbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6MhrZlvSP9pEB
// SIG // 9s7GdP32THJvEKt1MMU0sHrYUP4KWN1APMdUbZ1jdEgs
// SIG // sU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lUZNlz138eW0QB
// SIG // jloZkWsNn6Qo3GcZKCS6OEuabvshVGtqRRFHqfG3rsjo
// SIG // iV5PndLQTHa1V1QJsWkBRH58oWFsc/4Ku+xBZj1p/cvB
// SIG // QUl+fpO+y/g75LcVv7TOPqUxUYS8vwLBgqJ7Fx0ViY1w
// SIG // /ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr4A245oyZ1uEi
// SIG // 6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvpe784cETRkPHI
// SIG // qzqKOghif9lwY1NNje6CbaUFEMFxBmoQtB1VM1izoXBm
// SIG // 8qGCA00wggI1AgEBMIH5oYHRpIHOMIHLMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSUwIwYDVQQLExxNaWNyb3NvZnQgQW1l
// SIG // cmljYSBPcGVyYXRpb25zMScwJQYDVQQLEx5uU2hpZWxk
// SIG // IFRTUyBFU046MzcwMy0wNUUwLUQ5NDcxJTAjBgNVBAMT
// SIG // HE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoB
// SIG // ATAHBgUrDgMCGgMVAEsgyDU/uw24JemZsfYhdPa1d4QQ
// SIG // oIGDMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTAwDQYJKoZIhvcNAQELBQACBQDuVXBFMCIYDzIwMjYw
// SIG // OTE2MTk0NTA5WhgPMjAyNjA5MTcxOTQ1MDlaMHQwOgYK
// SIG // KwYBBAGEWQoEATEsMCowCgIFAO5VcEUCAQAwBwIBAAIC
// SIG // NPgwBwIBAAICEfMwCgIFAO5WwcUCAQAwNgYKKwYBBAGE
// SIG // WQoEAjEoMCYwDAYKKwYBBAGEWQoDAqAKMAgCAQACAweh
// SIG // IKEKMAgCAQACAwGGoDANBgkqhkiG9w0BAQsFAAOCAQEA
// SIG // BkN+Aw6/Qc9DIeULe60GmCKxb6Cx+Hn5DKhLQ6oKzNcx
// SIG // hEn1v/hU8KQTCKwqmDK0JsKgf2WwDH6Mn7g6eYAEyA+h
// SIG // x6E4xF+s4K8qj7u0tyJaoIWU5/q6nBlGsinN+vzxPmuG
// SIG // 1DjQErmDNbmLT4T+9cX+gjdp8D44Refc4yY8+FXeJJvw
// SIG // ZpYaoCkxOqdvVN6pX4Nu+B6KE7kDtGB4NbhdZrZRLDcY
// SIG // GeJv3H/00qemuStQCbZbKw3+qQ9MWwiP17Q1abIlVGpL
// SIG // v6yfNjuChPtjefq6cHlk/WqlqD2H+Lke4rle8BUxyo3C
// SIG // Phggqkd3z3o7KIopQMVt9+TcXI49ms37JDGCBA0wggQJ
// SIG // AgEBMIGTMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAACHzpwaeSiMC6VAAEAAAIfMA0GCWCGSAFlAwQC
// SIG // AQUAoIIBSjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQ
// SIG // AQQwLwYJKoZIhvcNAQkEMSIEIHojj5I1O7/N21nhIYol
// SIG // D00+3Wdw352VC8vvIl/qLm6tMIH6BgsqhkiG9w0BCRAC
// SIG // LzGB6jCB5zCB5DCBvQQgsCQK31aQKwy1RGQW7pNjQ/dR
// SIG // d1GcKJi49mF7fKQt/BQwgZgwgYCkfjB8MQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGlt
// SIG // ZS1TdGFtcCBQQ0EgMjAxMAITMwAAAh86cGnkojAulQAB
// SIG // AAACHzAiBCDxvD8xUwvIPTZvWVL3TcNPK1YfKsMboKPN
// SIG // /TuT/7UlyTANBgkqhkiG9w0BAQsFAASCAgA1STlv8Mvh
// SIG // gveMDcuRuazQU/LyOLMgw/Rl6j2TTpxEZEja+vcy/uIl
// SIG // mLjbRRflArqDVBDhVydniqgE8BwXYOzkd84ulTE8ABKe
// SIG // Srrp6BvSPuPwbKzqyYDJ6+Q74ZeCW9Hsx+hJyU9gklB+
// SIG // HuJey+4zoyjazbjhbF/5YTqf6TKTo0UNJwgi5Z2YYC/K
// SIG // u3ux2IFlllzHnxu6ysl0kZ1WGbaUKII74oCQ13mGQs9k
// SIG // EYaxGn4ZYEGmTqb9lZhzOhbKifHaYEv1PlR4U55lQ6M+
// SIG // MQbiokqi1pa+B6YZmWcfYbY53OY9HZbaJPx0CqvkgaHe
// SIG // uO+RJmQunNwWwX/CBoQf4dQ5STLf7et4ooLC5vtQhaPM
// SIG // 0rhtvkMBmi9XwzKXYvJlYx7CvFHgTclPYWphjqWpcJBy
// SIG // qoz2NPvdKD6Wd6Ur6siG+PJhOe2OGa+kWRrW3ghGvn3r
// SIG // X0F/8iWFeujtSG0zSmImKEYKCnl3ThJhRN2BFXEWlLNW
// SIG // zU9hd/ANDGFqHxCEgOLTvIeIBE6y7h2pJmK42jxVeh5H
// SIG // D6UuRdK8Qvo8SJZrkXmLWCN8iZvxYrzciWVSD/l10WrU
// SIG // u4EZ72rOX6BgYdg+p9rQu/woU1EVeU05E1P9imhMDJfz
// SIG // uERHT4JEhIbmZV4x6Yk6xiIUizKKMOExV+k3eV5QzpuB
// SIG // +am9/iVxYrfvBg==
// SIG // End signature block
