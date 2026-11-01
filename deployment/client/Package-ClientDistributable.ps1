<#
.SYNOPSIS
    Automated Build & Packaging Engine for CyberCenter Gaming Station Client Suite.
.DESCRIPTION
    Compiles, bundles, and packages the complete client suite (Agent service, Shell UI, HUD overlay,
    and security lockdown policies) into a self-contained, offline-deployable ZIP distribution artifact.
.PARAMETER OutputDir
    Destination directory for packaged releases. Default: 'deployment/client/dist'.
.PARAMETER Version
    Release version tag. Default: '2.4.0'.
.EXAMPLE
    .\Package-ClientDistributable.ps1 -Version "2.4.0"
#>
[CmdletBinding()]
param(
    [string]$OutputDir = "deployment/client/dist",
    [string]$Version = "2.4.0"
)

$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CyberCenter Client Suite Packaging Engine (v$Version) " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Resolve dotnet executable
$DotnetExe = "dotnet"
if (Test-Path "C:\Users\USER\.dotnet\dotnet.exe") {
    $DotnetExe = "C:\Users\USER\.dotnet\dotnet.exe"
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$DistRoot = Join-Path $ProjectRoot $OutputDir
$StagingFolder = Join-Path $DistRoot "CyberCenter-Station-v${Version}"
$ZipArtifact = Join-Path $DistRoot "CyberCenter-Station-v${Version}.zip"

# Clean prior staging
if (Test-Path $StagingFolder) {
    Remove-Item -Path $StagingFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $StagingFolder -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $StagingFolder "Agent") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $StagingFolder "Client") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $StagingFolder "Policies") -Force | Out-Null

Write-Host "`n[1/4] Staging Station Control Agent & Client Suite..." -ForegroundColor Cyan

# Copy Project Binaries / Sources to target bundle
$AgentSrc = Join-Path $ProjectRoot "src\Client\CyberCenter.Agent"
$ShellSrc = Join-Path $ProjectRoot "src\Client\CyberCenter.Shell"
$HudSrc = Join-Path $ProjectRoot "src\Client\CyberCenter.HUD"

# Copy Agent Files
Copy-Item -Path (Join-Path $AgentSrc "*.cs") -Destination (Join-Path $StagingFolder "Agent") -Force
Copy-Item -Path (Join-Path $AgentSrc "*.csproj") -Destination (Join-Path $StagingFolder "Agent") -Force
Copy-Item -Path (Join-Path $AgentSrc "appsettings.json") -Destination (Join-Path $StagingFolder "Agent") -Force

# Copy Shell & HUD Files
Copy-Item -Path (Join-Path $ShellSrc "*.*") -Destination (Join-Path $StagingFolder "Client") -Recurse -Force
Copy-Item -Path (Join-Path $HudSrc "*.*") -Destination (Join-Path $StagingFolder "Client") -Recurse -Force

Write-Host " [PASS] Agent, Shell, and HUD assets staged." -ForegroundColor Green

# Step 2: Copy Windows Hardening Policies & AppLocker Rules
Write-Host "`n[2/4] Bundling Security Lockdown & WDAC Whitelist Policies..." -ForegroundColor Cyan
$PoliciesSrc = Join-Path $ProjectRoot "deployment\windows-policies"
Copy-Item -Path (Join-Path $PoliciesSrc "*.*") -Destination (Join-Path $StagingFolder "Policies") -Recurse -Force
Write-Host " [PASS] Lockdown policies and AppLocker rules bundled." -ForegroundColor Green

# Step 3: Copy Automated Station Installer & Uninstaller
Write-Host "`n[3/4] Including Automation Scripts..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $ScriptDir "Install-CyberCenterStation.ps1") -Destination $StagingFolder -Force
Copy-Item -Path (Join-Path $ScriptDir "Uninstall-CyberCenterStation.ps1") -Destination $StagingFolder -Force

# Generate Distribution Manifest
$Manifest = @{
    PackageName     = "CyberCenter Gaming Station Suite"
    Version         = $Version
    BuildDateUtc    = (Get-Date).ToUniversalTime().ToString("o")
    TargetOS        = "Windows 10 / 11 (x64) Pro & Enterprise"
    Components      = @("CyberCenter.Agent", "CyberCenter.Shell", "CyberCenter.HUD", "WindowsLockdownPolicies")
    Author          = "En-Dhiaa"
    Architecture    = "Modular Monolith - Production Ready"
}
$ManifestJson = $Manifest | ConvertTo-Json -Depth 4
Set-Content -Path (Join-Path $StagingFolder "PACKAGE_MANIFEST.json") -Value $ManifestJson -Encoding UTF8
Write-Host " [PASS] Package manifest generated." -ForegroundColor Green

# Step 4: Create Compressed Distribution Archive (.ZIP)
Write-Host "`n[4/4] Generating Standalone Distribution ZIP Archive..." -ForegroundColor Cyan
if (Test-Path $ZipArtifact) {
    Remove-Item -Path $ZipArtifact -Force
}
Compress-Archive -Path "$StagingFolder\*" -DestinationPath $ZipArtifact -CompressionLevel Optimal
$ZipSize = (Get-Item $ZipArtifact).Length
$ZipHash = (Get-FileHash -Path $ZipArtifact -Algorithm SHA256).Hash

Write-Host " [SUCCESS] Distributable Package: $ZipArtifact" -ForegroundColor Green
Write-Host " [SIZE]    $([Math]::Round($ZipSize / 1KB, 1)) KB" -ForegroundColor Gray
Write-Host " [SHA-256] $ZipHash" -ForegroundColor Gray

# Write Checksum companion file
Set-Content -Path "${ZipArtifact}.sha256" -Value "$ZipHash  CyberCenter-Station-v${Version}.zip" -Encoding UTF8

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Station Client Packaging Completed Successfully! " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
