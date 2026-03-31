param(
    [string]$BucketName = "udemy-feminine-calculator"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$destination = "s3://$BucketName"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    throw "AWS CLI is not installed or not available on PATH."
}

# Configure static website settings so index.html is the landing page.
aws s3 website $destination --index-document index.html --error-document index.html | Out-Null

# Sync only static site files so index.html remains at the bucket root.
aws s3 sync $projectRoot $destination --delete `
    --exclude "*" `
    --include "index.html" `
    --include "css/*" `
    --include "css/**" `
    --include "js/*" `
    --include "js/**" `
    --include "images/*" `
    --include "images/**" `
    --include "resources/*" `
    --include "resources/**" `
    --exclude "js/*.test.js"

Write-Host "Deployment complete: $destination"