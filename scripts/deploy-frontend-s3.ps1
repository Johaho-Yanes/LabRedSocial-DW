# ============================================
# Script de Despliegue Frontend a S3
# ============================================

param(
    [string]$BucketName = "instagur-frontend",
    [string]$Region = "us-east-1",
    [string]$Profile = "default"
)

Write-Host "🚀 Desplegando Frontend a AWS S3..." -ForegroundColor Blue

# 1. Build del frontend
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 2. Sync con S3
Write-Host "☁️  Subiendo a S3..." -ForegroundColor Cyan
aws s3 sync dist/ "s3://$BucketName" --delete --profile $Profile --region $Region

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir a S3" -ForegroundColor Red
    exit 1
}

# 3. Configurar bucket para hosting estático
Write-Host "⚙️  Configurando bucket..." -ForegroundColor Cyan
aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html --profile $Profile --region $Region

# 4. Invalidar caché de CloudFront (si existe)
Write-Host "🔄 ¿Invalidar caché de CloudFront? (y/n)" -ForegroundColor Yellow
$invalidate = Read-Host

if ($invalidate -eq "y") {
    $distributionId = Read-Host "Ingresa CloudFront Distribution ID"
    if ($distributionId) {
        aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*" --profile $Profile
        Write-Host "✅ Caché invalidada" -ForegroundColor Green
    }
}

Set-Location ..

Write-Host "✅ Frontend desplegado exitosamente!" -ForegroundColor Green
Write-Host "🌐 URL: http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor Cyan
