<#
.SYNOPSIS
    Automated uninstallation and restoration script for CyberCenter Gaming Stations.
.DESCRIPTION
    Stops and removes CyberCenterAgent service, removes station lockdown policies,
    restores Windows Explorer shell for the guest account, and cleans up firewall rules.
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-AdminPrivileges)) {
    Write-Error "[FATAL] Administrator privileges are required to run this uninstall script."
    exit 1
}

$ServiceName = "CyberCenterAgent"

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host " CyberCenter Station Uninstallation Pipeline " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

# Step 1: Stop and Delete Windows Service
Write-Host "`n[1/4] Removing CyberCenter.Agent Service..." -ForegroundColor Cyan
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    & sc.exe delete $ServiceName | Out-Null
    Write-Host "  Service '$ServiceName' removed." -ForegroundColor Green
} else {
    Write-Host "  Service '$ServiceName' not found." -ForegroundColor Gray
}

# Step 2: Remove Firewall Rules
Write-Host "`n[2/4] Removing Firewall Rules..." -ForegroundColor Cyan
netsh advfirewall firewall delete rule name="CyberCenter Suite Inbound" > $null 2>&1
Write-Host "  Firewall rules cleaned up." -ForegroundColor Green

# Step 3: Restore Shell
Write-Host "`n[3/4] Restoring Default Windows Shell..." -ForegroundColor Cyan
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PoliciesDir = Join-Path (Split-Path -Parent $ScriptRoot) "windows-policies"
$ShellScript = Join-Path $PoliciesDir "Configure-ShellLauncher.ps1"
if (Test-Path $ShellScript) {
    & $ShellScript -TargetUser "CyberGuest" -Action Restore
}

# Step 4: Revert Security Restrictions
Write-Host "`n[4/4] Removing Security Restrictions..." -ForegroundColor Cyan
$RemoveReg = Join-Path $PoliciesDir "Remove-StationLockdown.reg"
if (Test-Path $RemoveReg) {
    & reg.exe import "$RemoveReg" | Out-Null
    Write-Host "  Imported Remove-StationLockdown.reg successfully." -ForegroundColor Green
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " CyberCenter Station Uninstallation Completed. " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
