# Script PowerShell para desplegar Frontend en S3 + CloudFront
# Ejecutar desde la raíz del proyecto

param(
    [string]$BucketName = "instagur-frontend",
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Desplegando Frontend en S3 + CloudFront..." -ForegroundColor Cyan
Write-Host ""

# Verificar AWS CLI
try {
    aws --version | Out-Null
} catch {
    Write-Host "❌ AWS CLI no está instalado" -ForegroundColor Red
    exit 1
}

# 1. Construir frontend
Write-Host "🏗️  Construyendo frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# 2. Crear bucket S3 si no existe
Write-Host "📦 Creando bucket S3..." -ForegroundColor Yellow
$BucketExists = aws s3 ls s3://$BucketName 2>$null
if (-not $BucketExists) {
    aws s3 mb s3://$BucketName --region $Region
    
    # Configurar como sitio web estático
    aws s3 website s3://$BucketName --index-document index.html --error-document index.html
    
    # Política de bucket pública
    $Policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${BucketName}/*"
    }
  ]
}
"@
    $Policy | Out-File -FilePath "bucket-policy.json" -Encoding utf8
    aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json
    Remove-Item "bucket-policy.json"
}

# 3. Subir archivos a S3
Write-Host "⬆️  Subiendo archivos a S3..." -ForegroundColor Yellow
aws s3 sync frontend/dist/ s3://$BucketName --delete --cache-control "max-age=31536000,public" --exclude "index.html"
aws s3 cp frontend/dist/index.html s3://$BucketName/index.html --cache-control "max-age=0,no-cache,no-store,must-revalidate"

# 4. Crear distribución CloudFront (opcional)
$CreateCF = Read-Host "¿Crear distribución CloudFront? (s/n)"
if ($CreateCF -eq "s" -or $CreateCF -eq "S") {
    Write-Host "📡 Creando distribución CloudFront..." -ForegroundColor Yellow
    Write-Host "Esto puede tomar varios minutos..." -ForegroundColor Cyan
    
    $DistributionConfig = @"
{
  "CallerReference": "instagur-$(Get-Date -Format 'yyyyMMddHHmmss')",
  "Comment": "InstaGur Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BucketName",
        "DomainName": "${BucketName}.s3-website-${Region}.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BucketName",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
"@
    
    $DistributionConfig | Out-File -FilePath "cf-config.json" -Encoding utf8
    $Distribution = aws cloudfront create-distribution --distribution-config file://cf-config.json
    Remove-Item "cf-config.json"
    
    $DistributionId = ($Distribution | ConvertFrom-Json).Distribution.Id
    $DomainName = ($Distribution | ConvertFrom-Json).Distribution.DomainName
    
    Write-Host ""
    Write-Host "✅ Distribución CloudFront creada!" -ForegroundColor Green
    Write-Host "   ID: $DistributionId" -ForegroundColor Cyan
    Write-Host "   Dominio: $DomainName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⏳ La distribución puede tardar 15-20 minutos en estar disponible" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Frontend desplegado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "   S3: http://${BucketName}.s3-website-${Region}.amazonaws.com" -ForegroundColor Blue
if ($CreateCF -eq "s" -or $CreateCF -eq "S") {
    Write-Host "   CloudFront: https://$DomainName" -ForegroundColor Blue
}
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "  aws s3 sync frontend/dist/ s3://$BucketName --delete  # Actualizar archivos"
Write-Host "  aws cloudfront create-invalidation --distribution-id $DistributionId --paths '/*'  # Limpiar caché"
Write-Host ""
