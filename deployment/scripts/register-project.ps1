$RegistryPath = "C:\Users\USER\.project-publisher\projects.json"
$items = @(Get-Content $RegistryPath -Raw | ConvertFrom-Json)
$filtered = @($items | Where-Object { $_.name -ne "cybercenter" })
$filtered += [PSCustomObject]@{
    name = "cybercenter"
    path = (Resolve-Path ".").Path
    url = "https://github.com/En-Dhiaa/CyberCenter"
    visibility = "private"
    updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
}
$filtered | ConvertTo-Json -Depth 5 | Set-Content -Path $RegistryPath -Encoding UTF8
Write-Host "CyberCenter registered successfully in $RegistryPath" -ForegroundColor Green
