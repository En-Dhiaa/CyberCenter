# CyberCenter Automated PostgreSQL Backup Script
param(
    [string]$BackupDir = "C:\CyberCenter\Backups",
    [string]$Database = "cybercenter_db",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres",
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$Timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$BackupFile = Join-Path $BackupDir "cybercenter_backup_${Timestamp}.sql.gz"

Write-Host "[$Timestamp] Starting backup for database '$Database'..." -ForegroundColor Cyan

# Execute pg_dump if installed
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    pg_dump -h $Host -p $Port -U $User -F c -b -v -f $BackupFile $Database
    Write-Host "Backup successfully saved to: $BackupFile" -ForegroundColor Green
} else {
    Write-Warning "pg_dump command not found in PATH. Please verify PostgreSQL client tools are installed."
}

# Cleanup backups older than retention days
Get-ChildItem -Path $BackupDir -Filter "cybercenter_backup_*.sql.gz" |
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
    Remove-Item -Force

