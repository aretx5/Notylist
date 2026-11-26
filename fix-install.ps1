# Fix Next.js SWC Module Issue
Write-Host "🔧 Fixing Next.js installation..." -ForegroundColor Cyan

# Step 1: Clean everything
Write-Host "1️⃣ Cleaning node_modules and cache..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "   ✅ Deleted node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "   ✅ Deleted package-lock.json" -ForegroundColor Green
}

if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "   ✅ Deleted .next cache" -ForegroundColor Green
}

npm cache clean --force
Write-Host "   ✅ Cleared npm cache" -ForegroundColor Green

# Step 2: Install with legacy peer deps
Write-Host ""
Write-Host "2️⃣ Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Installation successful!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Installation failed" -ForegroundColor Red
    exit 1
}

# Step 3: Verify installation
Write-Host ""
Write-Host "3️⃣ Verifying installation..." -ForegroundColor Yellow

if (Test-Path "node_modules\@swc\helpers") {
    Write-Host "   ✅ @swc/helpers installed correctly" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  @swc/helpers missing, trying manual install..." -ForegroundColor Yellow
    npm install @swc/helpers --legacy-peer-deps
}

if (Test-Path "node_modules\next") {
    Write-Host "   ✅ Next.js installed correctly" -ForegroundColor Green
} else {
    Write-Host "   ❌ Next.js missing" -ForegroundColor Red
}

# Step 4: Done
Write-Host ""
Write-Host "✨ All done! You can now run:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
