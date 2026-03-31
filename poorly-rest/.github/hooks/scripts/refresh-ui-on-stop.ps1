Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Path $MyInvocation.MyCommand.Path -Parent
$repoRoot = Resolve-Path (Join-Path $scriptRoot '..\..\..')

$expressPath = Join-Path $repoRoot 'calculator-express\src\index.ts'
$flaskPath = Join-Path $repoRoot 'calculator-flask\app.py'
$springPath = Join-Path $repoRoot 'calculator-spring-boot\src\main\resources\application.properties'
$openApiPath = Join-Path $repoRoot 'openapi.yaml'
$uiRoot = Join-Path $repoRoot 'calculator-ui'
$syncScript = Join-Path $uiRoot 'scripts\sync-openapi.mjs'
$pidFile = Join-Path $uiRoot '.ng-serve.pid'
$logFile = Join-Path $uiRoot 'ng-serve.log'
$errFile = Join-Path $uiRoot 'ng-serve.err.log'

function Get-PortFromRegex {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Pattern,
    [Parameter(Mandatory = $true)][string]$Name
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Could not locate $Name source file: $Path"
  }

  $content = Get-Content -LiteralPath $Path -Raw
  $match = [regex]::Match($content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Multiline)

  if (-not $match.Success -or -not $match.Groups[1].Success) {
    throw "Could not detect $Name port from $Path"
  }

  return [int]$match.Groups[1].Value
}

function Update-OpenApiServerUrl {
  param(
    [Parameter(Mandatory = $true)][string]$Yaml,
    [Parameter(Mandatory = $true)][string]$Description,
    [Parameter(Mandatory = $true)][int]$Port
  )

  $escapedDescription = [regex]::Escape($Description)
  $pattern = "(?ms)(-\s+url:\s*http://localhost:)\d+(\s*\r?\n\s*description:\s*$escapedDescription)"
  return [regex]::Replace($Yaml, $pattern, "`${1}$Port`${2}")
}

$expressPort = Get-PortFromRegex -Path $expressPath -Pattern 'const\s+port\s*=\s*(\d+)' -Name 'ExpressJS'
$flaskPort = Get-PortFromRegex -Path $flaskPath -Pattern 'app\.run\([^\)]*port\s*=\s*(\d+)' -Name 'Flask'
$springPort = Get-PortFromRegex -Path $springPath -Pattern '^\s*server\.port\s*=\s*(\d+)' -Name 'Spring Boot'

Write-Host "[hook:stop] Detected ports => ExpressJS:$expressPort Flask:$flaskPort Spring:$springPort"

if (-not (Test-Path -LiteralPath $openApiPath)) {
  throw "openapi.yaml not found at $openApiPath"
}

$openApiText = Get-Content -LiteralPath $openApiPath -Raw
$updatedOpenApi = $openApiText
$updatedOpenApi = Update-OpenApiServerUrl -Yaml $updatedOpenApi -Description 'TypeScript and ExpressJS implementation' -Port $expressPort
$updatedOpenApi = Update-OpenApiServerUrl -Yaml $updatedOpenApi -Description 'Python and Flask implementation' -Port $flaskPort
$updatedOpenApi = Update-OpenApiServerUrl -Yaml $updatedOpenApi -Description 'Java and Spring Boot implementation' -Port $springPort

if ($updatedOpenApi -ne $openApiText) {
  Set-Content -LiteralPath $openApiPath -Value $updatedOpenApi -Encoding UTF8
  Write-Host '[hook:stop] Updated OpenAPI server URLs with latest backend ports.'
} else {
  Write-Host '[hook:stop] OpenAPI server URLs already match backend ports.'
}

Push-Location $uiRoot
try {
  if (-not (Test-Path -LiteralPath $syncScript)) {
    throw "sync-openapi script not found at $syncScript"
  }

  & npm run sync:openapi
  if ($LASTEXITCODE -ne 0) {
    throw 'npm run sync:openapi failed.'
  }

  & npm run build
  if ($LASTEXITCODE -ne 0) {
    throw 'npm run build failed.'
  }

  if (Test-Path -LiteralPath $pidFile) {
    $oldPidText = (Get-Content -LiteralPath $pidFile -Raw).Trim()
    if ($oldPidText -match '^\d+$') {
      $oldPid = [int]$oldPidText
      Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
      Write-Host "[hook:stop] Stopped previous Angular server process: $oldPid"
    }
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }

  if (Test-Path -LiteralPath $logFile) {
    Remove-Item -LiteralPath $logFile -Force -ErrorAction SilentlyContinue
  }

  if (Test-Path -LiteralPath $errFile) {
    Remove-Item -LiteralPath $errFile -Force -ErrorAction SilentlyContinue
  }

  $process = Start-Process -FilePath 'npm.cmd' -ArgumentList @('start', '--', '--host', '0.0.0.0', '--port', '4200') -WorkingDirectory $uiRoot -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru
  Set-Content -LiteralPath $pidFile -Value $process.Id -Encoding ASCII

  Write-Host "[hook:stop] Angular dev server restarted on http://localhost:4200 (PID: $($process.Id))."
} finally {
  Pop-Location
}
 