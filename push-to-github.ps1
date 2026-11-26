# Push all files to GitHub

Write-Host "Checking git status..." -ForegroundColor Cyan

# Check if git repo exists
if (-not (Test-Path ".git")) {
    Write-Host "No git repository found. Initializing..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check if remote exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "Enter your GitHub repository URL (e.g., https://github.com/aretx5/notylist.git):" -ForegroundColor Yellow
    $repoUrl = Read-Host "Repository URL"
    git remote add origin $repoUrl
}

Write-Host "`nStaging all files..." -ForegroundColor Cyan
git add .

Write-Host "`nCreating commit..." -ForegroundColor Cyan
git commit -m "Add all project files - components, lib, and configuration"

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`nDone! Files pushed to GitHub." -ForegroundColor Green
Write-Host "Vercel will automatically rebuild your project." -ForegroundColor Green
