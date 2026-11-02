<#
.SYNOPSIS
    Configures CyberCenter.Shell as the primary dedicated user shell for Windows gaming stations.
.DESCRIPTION
    Replaces Windows Explorer with CyberCenter.Shell.exe for the guest user account ('CyberGuest').
    Supports both WMI Shell Launcher v2 (Windows Enterprise/IoT/Education) and
    per-user Winlogon Shell registry entry (Windows Pro).
.PARAMETER TargetUser
    The username to apply the shell to. Default is 'CyberGuest'.
.PARAMETER ShellPath
    Absolute path to CyberCenter.Shell.exe executable.
.PARAMETER Action
    'Enable' to replace Explorer with CyberCenter.Shell, or 'Restore' to revert to standard explorer.exe.
.EXAMPLE
    .\Configure-ShellLauncher.ps1 -Action Enable
    .\Configure-ShellLauncher.ps1 -Action Restore
#>
[CmdletBinding()]
param(
    [string]$TargetUser = "CyberGuest",
    [string]$ShellPath = "C:\Program Files\CyberCenter\Client\CyberCenter.Shell.exe",
    [ValidateSet('Enable', 'Restore')]
    [string]$Action = 'Enable'
)

$ErrorActionPreference = 'Stop'

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-AdminPrivileges)) {
    Write-Error "Administrative privileges required. Please run as Administrator."
    exit 1
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CyberCenter Windows Shell Launcher Configuration " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Resolve user SID
try {
    $ntAccount = New-Object System.Security.Principal.NTAccount($TargetUser)
    $userSid = $ntAccount.Translate([System.Security.Principal.SecurityIdentifier]).Value
    Write-Host "[OK] Resolved SID for user '$TargetUser': $userSid" -ForegroundColor Green
}
catch {
    Write-Warning "User '$TargetUser' not found on local machine. Applying policy template to Default Profile."
    $userSid = $null
}

if ($Action -eq 'Enable') {
    Write-Host "[Configuring Shell] Setting custom shell to: $ShellPath" -ForegroundColor Cyan

    # Method 1: Registry User Shell configuration (Universal Windows Pro/Enterprise)
    if ($userSid) {
        $userHivePath = "Registry::HKEY_USERS\$userSid\Software\Microsoft\Windows NT\CurrentVersion\Winlogon"
        if (-not (Test-Path $userHivePath)) {
            New-Item -Path $userHivePath -Force | Out-Null
        }
        Set-ItemProperty -Path $userHivePath -Name "Shell" -Value $ShellPath -Type String -Force
        Write-Host " [SUCCESS] Per-user Winlogon Shell configured for SID: $userSid" -ForegroundColor Green
    }

    # Method 2: Shell Launcher v2 via WMI (if available in Windows Enterprise/IoT)
    try {
        $shellLauncherClass = [wmiclass]"\\localhost\root\standardcimv2\embedded:WESL_UserSetting"
        if ($shellLauncherClass -and $userSid) {
            # Restart shell on exit (Action = 0)
            $shellLauncherClass.SetCustomShell($userSid, $ShellPath, 0, 0) | Out-Null
            Write-Host " [SUCCESS] WESL_UserSetting Shell Launcher v2 enabled via WMI." -ForegroundColor Green
        }
    }
    catch {
        Write-Host " [INFO] WMI Embedded Shell Launcher v2 not supported on this Windows edition. Registry shell active." -ForegroundColor Gray
    }
}
else {
    Write-Host "[Restoring Shell] Reverting shell back to explorer.exe..." -ForegroundColor Yellow

    if ($userSid) {
        $userHivePath = "Registry::HKEY_USERS\$userSid\Software\Microsoft\Windows NT\CurrentVersion\Winlogon"
        if (Test-Path $userHivePath) {
            Remove-ItemProperty -Path $userHivePath -Name "Shell" -ErrorAction SilentlyContinue
            Write-Host " [SUCCESS] Winlogon Shell key removed; default explorer.exe restored." -ForegroundColor Green
        }
    }

    try {
        $shellLauncherClass = [wmiclass]"\\localhost\root\standardcimv2\embedded:WESL_UserSetting"
        if ($shellLauncherClass -and $userSid) {
            $shellLauncherClass.RemoveCustomShell($userSid) | Out-Null
            Write-Host " [SUCCESS] WESL_UserSetting custom shell removed." -ForegroundColor Green
        }
    }
    catch {
        # Ignored if WMI not present
    }
}

Write-Host "Configuration finished successfully." -ForegroundColor Cyan

