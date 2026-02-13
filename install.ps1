# Script d'installation automatique UniLogi Sécurisé
# Pour Windows PowerShell

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔐 UniLogi - Installation Sécurisée" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Chemin de base de l'application
$basePath = "C:\Users\RN-Re\Desktop\unilogi-main\unilogi-main"

# Vérifier que le dossier existe
if (-Not (Test-Path $basePath)) {
    Write-Host "❌ Erreur: Le dossier $basePath n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Dossier de base: $basePath" -ForegroundColor Green
Write-Host ""

# ========== BACKEND ==========
Write-Host "🔧 Configuration du Backend..." -ForegroundColor Yellow

$backendPath = Join-Path $basePath "backend"

# Sauvegarder l'ancien fichier
if (Test-Path (Join-Path $backendPath "server-full.js")) {
    Copy-Item (Join-Path $backendPath "server-full.js") (Join-Path $backendPath "server-full.js.backup")
    Write-Host "✓ Sauvegarde de l'ancien serveur créée" -ForegroundColor Green
}

# Installer les nouvelles dépendances
Write-Host "📦 Installation des dépendances de sécurité..." -ForegroundColor Yellow
Set-Location $backendPath

# Vérifier si npm est disponible
try {
    npm --version | Out-Null
} catch {
    Write-Host "❌ Erreur: npm n'est pas installé" -ForegroundColor Red
    exit 1
}

# Installer les nouvelles dépendances
npm install helmet express-rate-limit validator --save

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dépendances installées avec succès" -ForegroundColor Green

# Générer une clé JWT sécurisée
Write-Host ""
Write-Host "🔑 Génération d'une clé JWT sécurisée..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Créer le fichier .env
$envContent = @"
# Configuration du serveur
PORT=3001
HTTPS_PORT=3443
USE_HTTPS=false

# Sécurité JWT
JWT_SECRET=$jwtSecret

# CORS - Origines autorisées
ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5

# Base de données
DB_FILE=db.json

# Environnement
NODE_ENV=development
"@

$envContent | Out-File -FilePath (Join-Path $backendPath ".env") -Encoding UTF8
Write-Host "✓ Fichier .env créé avec une clé JWT sécurisée" -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ Installation terminée !" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Remplacez le fichier backend/server-full.js par le nouveau fichier sécurisé" -ForegroundColor White
Write-Host "2. Remplacez le fichier frontend/src/pages/Login.jsx par le fichier corrigé" -ForegroundColor White
Write-Host ""
Write-Host "3. Démarrez le backend :" -ForegroundColor White
Write-Host "   cd $backendPath" -ForegroundColor Cyan
Write-Host "   node server-full.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Démarrez le frontend :" -ForegroundColor White
Write-Host "   cd $basePath\frontend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 L'application sera accessible sur :" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔒 Sécurité activée :" -ForegroundColor Green
Write-Host "   ✓ Helmet (Headers sécurisés)" -ForegroundColor White
Write-Host "   ✓ CORS configuré" -ForegroundColor White
Write-Host "   ✓ Rate limiting" -ForegroundColor White
Write-Host "   ✓ Validation des données" -ForegroundColor White
Write-Host "   ✓ Hashing bcrypt (coût 12)" -ForegroundColor White
Write-Host "   ✓ JWT avec expiration" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
