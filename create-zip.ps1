# PowerShell script para criar ZIP com caminhos Unix
param(
    [string]$SourcePath = "temp-plugin",
    [string]$DestinationPath = "todday-modas-brecho-prod.zip"
)

# Limpar arquivo existente
if (Test-Path $DestinationPath) {
    Remove-Item $DestinationPath -Force
}

# Criar arquivo ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem

# Configurar para usar caminhos Unix
$compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
$entryEncoding = [System.Text.Encoding]::UTF8

# Criar ZIP
[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $SourcePath,
    $DestinationPath,
    $compressionLevel,
    $false, # includeBaseDirectory - false para manter estrutura correta
    $entryEncoding
)

Write-Host "ZIP criado em: $DestinationPath"
Write-Host "Tamanho: $( (Get-Item $DestinationPath).Length ) bytes"