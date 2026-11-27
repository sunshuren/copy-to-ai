param(
    [Parameter(Mandatory=$true)][ValidatePattern('^[a-p]{32}$')][string]$ExtensionId,
    [ValidateSet('Edge','Chrome')][string]$Browser = 'Edge'
)
$ErrorActionPreference = 'Stop'
$dir = Join-Path $env:LOCALAPPDATA "AI Relay\Clipboard-$Browser"
New-Item -ItemType Directory -Force $dir | Out-Null
$source = (Get-Content -Raw -Encoding UTF8 (Join-Path $PSScriptRoot 'PdfClipboard.cs')).Replace('EXTENSION_ID', $ExtensionId)
$sourcePath = Join-Path $dir 'PdfClipboard.cs'
[IO.File]::WriteAllText($sourcePath,$source)
$exe = Join-Path $dir 'PdfClipboard.exe'
$csc = Join-Path $env:WINDIR 'Microsoft.NET\Framework\v4.0.30319\csc.exe'
& $csc /nologo /target:exe "/out:$exe" /reference:System.Windows.Forms.dll /reference:System.Web.Extensions.dll $sourcePath
if ($LASTEXITCODE) { throw 'Unable to build PDF clipboard helper.' }
$manifest = Join-Path $dir 'host.json'
$config = @{ name='local.airelay.pdfclipboard'; description='Copy to AI PDF clipboard'; path=$exe; type='stdio'; allowed_origins=@("chrome-extension://$ExtensionId/") }
[IO.File]::WriteAllText($manifest, ($config | ConvertTo-Json))
$vendor = if ($Browser -eq 'Edge') {'Microsoft\Edge'} else {'Google\Chrome'}
(New-Item -Force "HKCU:\Software\$vendor\NativeMessagingHosts\local.airelay.pdfclipboard").SetValue('',$manifest)
Write-Host "Copy to AI clipboard helper registered for $Browser."
