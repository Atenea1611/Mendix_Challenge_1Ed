# Inicia el servidor compartido, con las mismas reglas que producción.
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error 'Instala Node.js 24 o posterior antes de iniciar.'
    exit 1
}
if (-not (Test-Path '.env')) {
    Write-Error 'Copia .env.example a .env y configura las credenciales. Consulta README_SERVER.md.'
    exit 1
}
node --env-file=.env server/index.cjs
exit $LASTEXITCODE
