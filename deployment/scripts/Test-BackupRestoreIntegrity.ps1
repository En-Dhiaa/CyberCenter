<#
.SYNOPSIS
    Automated Test Harness for CyberCenter Backup and Restore Pipeline.
.DESCRIPTION
    Tests end-to-end backup generation, SHA-256 integrity calculation,
    tamper detection (corrupted archive), and restore validation.
#>
$ErrorActionPreference = 'Stop'

Write-Host "==========================================================" -ForegroundColor Magenta
Write-Host " Running Automated Backup & Restore Verification Suite... " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Magenta

$TestDir = Join-Path $PSScriptRoot "test_backup_temp"
if (Test-Path $TestDir) {
    Remove-Item -Path $TestDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TestDir -Force | Out-Null

try {
    # 1. Run Backup
    Write-Host "`n[TEST 1] Testing Backup Generation & SHA-256 Manifest Creation..." -ForegroundColor Cyan
    $BackupScript = Join-Path $PSScriptRoot "Backup-CyberCenterDatabase.ps1"
    $backupResult = & $BackupScript -BackupDir $TestDir -DatabaseName "cybercenter_test"
    
    $sqlFile = $backupResult.BackupFile
    $metaFile = $backupResult.ManifestFile
    
    if (-not (Test-Path $sqlFile) -or -not (Test-Path $metaFile)) {
        throw "Backup artifacts were not generated as expected."
    }
    Write-Host " [PASS] Backup archive and manifest exist." -ForegroundColor Green

    # 2. Test Manifest Integrity
    Write-Host "`n[TEST 2] Verifying Manifest Checksum Against Physical File..." -ForegroundColor Cyan
    $metaJson = Get-Content -Path $metaFile -Raw | ConvertFrom-Json
    $calculatedHash = (Get-FileHash -Path $sqlFile -Algorithm SHA256).Hash
    
    if ($metaJson.Sha256Checksum -ne $calculatedHash) {
        throw "Calculated hash does not match manifest hash."
    }
    Write-Host " [PASS] Manifest SHA-256 checksum matches physical file." -ForegroundColor Green

    # 3. Test Clean Restore
    Write-Host "`n[TEST 3] Testing Valid Archive Restore Execution..." -ForegroundColor Cyan
    $RestoreScript = Join-Path $PSScriptRoot "Restore-CyberCenterDatabase.ps1"
    & $RestoreScript -BackupFilePath $sqlFile -TargetDatabase "cybercenter_test"
    Write-Host " [PASS] Clean restore executed successfully." -ForegroundColor Green

    # 4. Test Tamper Detection (Negative Test)
    Write-Host "`n[TEST 4] Testing Tamper Detection on Corrupted Backup File..." -ForegroundColor Cyan
    # Append corruption byte to the sql file
    Add-Content -Path $sqlFile -Value "-- MALICIOUS_INJECTION_OR_DATA_CORRUPTION"
    
    $tamperDetected = $false
    try {
        & $RestoreScript -BackupFilePath $sqlFile -TargetDatabase "cybercenter_test" 2>&1 | Out-Null
    }
    catch {
        $tamperDetected = $true
        Write-Host " [PASS] Corrupted archive correctly caught by SHA-256 integrity check!" -ForegroundColor Green
    }

    if (-not $tamperDetected) {
        throw "FATAL: Restore script did NOT reject a tampered backup file!"
    }

    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " ALL BACKUP & RESTORE INTEGRITY TESTS PASSED (4/4)! " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
}
finally {
    # Clean up test files
    if (Test-Path $TestDir) {
        Remove-Item -Path $TestDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

