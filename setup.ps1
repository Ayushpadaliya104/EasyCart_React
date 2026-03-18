# EasyCart Quick Start Setup Script (PowerShell)
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   EasyCart - Quick Start Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm installation
Write-Host "`n[2/5] Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm -v
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "`n[3/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# Create .env file if it doesn't exist
Write-Host "`n[4/5] Checking environment configuration..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Start development server
Write-Host "`n[5/5] Starting development server..." -ForegroundColor Yellow
Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "   ✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application will open at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor Cyan
Write-Host "  Email: demo@example.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

npm start
