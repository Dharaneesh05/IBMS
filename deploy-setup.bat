@echo off
echo ================================
echo   JEWELLERY INVENTORY SYSTEM
echo   Deployment Setup Script
echo ================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed!
    echo Please download and install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init
if errorlevel 1 (
    echo [INFO] Git repository already initialized
)

echo.
echo [2/5] Adding all files to Git...
git add .

echo.
echo [3/5] Creating initial commit...
git commit -m "Initial commit - Jewellery Inventory System"
if errorlevel 1 (
    echo [INFO] No changes to commit or already committed
)

echo.
echo [4/5] Setting up branch...
git branch -M main

echo.
echo ================================
echo   NEXT STEPS:
echo ================================
echo.
echo 1. Create a new repository on GitHub:
echo    https://github.com/new
echo.
echo 2. Copy the repository URL (example):
echo    https://github.com/YOUR_USERNAME/jewellery-inventory.git
echo.
echo 3. Run this command with YOUR repository URL:
echo    git remote add origin YOUR_GITHUB_URL
echo    git push -u origin main
echo.
echo 4. Follow the deployment guide in DEPLOYMENT.md
echo.
echo ================================
pause
