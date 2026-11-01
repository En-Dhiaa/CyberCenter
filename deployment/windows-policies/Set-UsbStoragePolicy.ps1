<#
.SYNOPSIS
    Configures USB Mass Storage policy on CyberCenter gaming stations.
.DESCRIPTION
    Safely disables or enables USB Mass Storage (flash drives, external HDDs)
    while ensuring Gaming Peripherals (USB Mice, Keyboards, Headsets, Webcams)
    remain 100% active and unblocked.
.PARAMETER Mode
    'Block' to prevent flash drives / unauthorized data exfiltration.
    'Allow' to permit external USB storage (for maintenance / game file transfers).
.EXAMPLE
    .\Set-UsbStoragePolicy.ps1 -Mode Block
#>
[CmdletBinding()]
param(
    [ValidateSet('Block', 'Allow')]
    [string]$Mode = 'Block'
)

$ErrorActionPreference = 'Stop'

function Test-AdminPrivileges {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-AdminPrivileges)) {
    Write-Error "Administrative privileges required. Please re-run this script in an elevated PowerShell prompt."
    exit 1
}

$RegistryPath = "HKLM:\SYSTEM\CurrentControlSet\Services\USBSTOR"

try {
    if ($Mode -eq 'Block') {
        Write-Host "[CyberCenter Hardening] Blocking USB Mass Storage devices..." -ForegroundColor Cyan
        # Value 4 = Disabled
        Set-ItemProperty -Path $RegistryPath -Name "Start" -Value 4 -Type DWord -Force
        
        Write-Host " [SUCCESS] USB Mass Storage disabled (Start = 4)." -ForegroundColor Green
        Write-Host " [INFO] USB HID peripherals (Mice, Keyboards, Headsets) remain unaffected and fully operational." -ForegroundColor Gray
    }
    else {
        Write-Host "[CyberCenter Maintenance] Enabling USB Mass Storage devices..." -ForegroundColor Yellow
        # Value 3 = Manual/Trigger (Windows default)
        Set-ItemProperty -Path $RegistryPath -Name "Start" -Value 3 -Type DWord -Force
        
        Write-Host " [SUCCESS] USB Mass Storage enabled (Start = 3)." -ForegroundColor Green
    }
}
catch {
    Write-Error "Failed to update USB storage policy: $_"
    exit 1
}
