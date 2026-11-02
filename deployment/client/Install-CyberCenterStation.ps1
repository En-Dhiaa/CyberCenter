<#
.SYNOPSIS
    Automated installation and provisioning script for CyberCenter Gaming Stations.
.DESCRIPTION
    Installs CyberCenter.Agent as a LocalSystem Windows Service, prepares directory structure,
    configures Windows Firewall rules, sets up the non-privileged 'CyberGuest' account,
    and applies station security hardening policies.
.PARAMETER ServerUrl
    Central CyberCenter Server URL (e.g. http://192.168.1.100:5000).
.PARAMETER StationNumber
    Station identifier integer (e.g. 1 to 50).
.PARAMETER AutoLogon
    Configures automatic logon for the CyberGuest user. Default is $true.
.EXAMPLE
    .\Install-CyberCenterStation.ps1 -ServerUrl "http://192.168.1.100:5000" -StationNumber 5 -AutoLogon $true
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ServerUrl = "http://192.168.1.100:5000",
    
    [Parameter(Mandatory = $false)]
    [int]$StationNumber = 1,

    [Parameter(Mandatory = $false)]
    [bool]$AutoLogon = $true
)

$ErrorActionPreference = 'Stop'

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-AdminPrivileges)) {
    Write-Error "[FATAL] Administrator privileges are required to run this installation script."
    exit 1
}

$InstallDir = "C:\Program Files\CyberCenter"
$AgentDir = Join-Path $InstallDir "Agent"
$ClientDir = Join-Path $InstallDir "Client"
$LogsDir = "C:\ProgramData\CyberCenter\Logs"
$ServiceName = "CyberCenterAgent"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CyberCenter Station Installation & Provisioning Pipeline " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Server URL     : $ServerUrl" -ForegroundColor Gray
Write-Host "Station Number : $StationNumber" -ForegroundColor Gray
Write-Host "Install Target : $InstallDir" -ForegroundColor Gray

# Step 1: Create Directories
Write-Host "`n[1/6] Creating Directory Structure..." -ForegroundColor Cyan
@($InstallDir, $AgentDir, $ClientDir, $LogsDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
        Write-Host "  Created: $_" -ForegroundColor Green
    }
}

# Step 2: Write station configuration file
Write-Host "`n[2/6] Writing Station Configuration (appsettings.json)..." -ForegroundColor Cyan
$ConfigPath = Join-Path $AgentDir "appsettings.json"
$ConfigJson = @"
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "CyberCenter": {
    "ServerUrl": "$ServerUrl",
    "StationNumber": $StationNumber,
    "HeartbeatIntervalSeconds": 5,
    "HmacSharedSecret": "CYBERCENTER_STATION_HMAC_PRESHARED_SECRET_2026_PRODUCTION",
    "AgentVersion": "2.4.0"
  }
}
"@
Set-Content -Path $ConfigPath -Value $ConfigJson -Encoding UTF8
Write-Host "  Saved config to: $ConfigPath" -ForegroundColor Green

# Step 3: Configure Windows Firewall
Write-Host "`n[3/6] Configuring Windows Firewall Rules..." -ForegroundColor Cyan
try {
    # Allow CyberCenter Agent & HUD Communication
    netsh advfirewall firewall delete rule name="CyberCenter Suite Inbound" > $null 2>&1
    netsh advfirewall firewall add rule name="CyberCenter Suite Inbound" dir=in action=allow protocol=TCP localport=5000-5005 profile=any | Out-Null
    Write-Host "  Configured firewall rule for ports 5000-5005." -ForegroundColor Green
}
catch {
    Write-Warning "Could not register firewall rule: $_"
}

# Step 4: Provision CyberGuest Local Account
Write-Host "`n[4/6] Provisioning 'CyberGuest' Non-Admin Account..." -ForegroundColor Cyan
$GuestUser = "CyberGuest"
$GuestPassword = "CyberStationGuest2026!"

$existingUser = Get-LocalUser -Name $GuestUser -ErrorAction SilentlyContinue
if (-not $existingUser) {
    $secPass = ConvertTo-SecureString $GuestPassword -AsPlainText -Force
    New-LocalUser -Name $GuestUser -Password $secPass -FullName "CyberCenter Station Guest" -Description "Standard non-privileged gaming station session account" -PasswordNeverExpires $true | Out-Null
    Write-Host "  Created user '$GuestUser'." -ForegroundColor Green
} else {
    Write-Host "  User '$GuestUser' already exists." -ForegroundColor Gray
}

# Ensure CyberGuest is only in Users group (never in Administrators)
try {
    Remove-LocalGroupMember -Group "Administrators" -Member $GuestUser -ErrorAction SilentlyContinue
    Add-LocalGroupMember -Group "Users" -Member $GuestUser -ErrorAction SilentlyContinue
} catch {}

# Step 5: Register CyberCenter.Agent Windows Service
Write-Host "`n[5/6] Registering CyberCenter.Agent as Windows Service..." -ForegroundColor Cyan
$AgentExe = Join-Path $AgentDir "CyberCenter.Agent.exe"

# Check if service already exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "  Stopping existing service..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    & sc.exe delete $ServiceName | Out-Null
    Start-Sleep -Seconds 2
}

# Create Windows Service running as LocalSystem
& sc.exe create $ServiceName binPath= "`"$AgentExe`"" start= auto displayName= "CyberCenter Station Control Agent" | Out-Null
& sc.exe failure $ServiceName reset= 0 actions= restart/5000/restart/5000/restart/10000 | Out-Null
Write-Host "  Service '$ServiceName' registered with auto-restart recovery policy." -ForegroundColor Green

# Step 6: Apply Security Lockdown & Shell Launcher
Write-Host "`n[6/6] Applying Security Hardening Policies..." -ForegroundColor Cyan
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PoliciesDir = Join-Path (Split-Path -Parent $ScriptRoot) "windows-policies"
$LockdownReg = Join-Path $PoliciesDir "Apply-StationLockdown.reg"

if (Test-Path $LockdownReg) {
    & reg.exe import "$LockdownReg" | Out-Null
    Write-Host "  Imported Apply-StationLockdown.reg successfully." -ForegroundColor Green
}

# Configure Shell Launcher
$ShellScript = Join-Path $PoliciesDir "Configure-ShellLauncher.ps1"
if (Test-Path $ShellScript) {
    & $ShellScript -TargetUser $GuestUser -ShellPath (Join-Path $ClientDir "CyberCenter.Shell.exe") -Action Enable
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " CyberCenter Station Installation Completed Successfully! " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

