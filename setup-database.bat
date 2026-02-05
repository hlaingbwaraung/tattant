@echo off
echo ========================================
echo Tattant Database Setup Script
echo ========================================
echo.

echo Step 1: Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first and add it to your PATH
    pause
    exit /b 1
)
echo PostgreSQL found!
echo.

echo Step 2: Creating database...
echo Please enter your PostgreSQL password when prompted.
psql -U postgres -c "CREATE DATABASE tattant;" 2>nul
if %errorlevel% equ 0 (
    echo Database 'tattant' created successfully!
) else (
    echo Database might already exist or there was an error.
    echo This is usually OK - continuing...
)
echo.

echo Step 3: Running migrations...
cd server
call npm run db:migrate
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    pause
    exit /b 1
)
echo Migrations completed!
echo.

echo Step 4: Seeding initial data...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ERROR: Seeding failed!
    pause
    exit /b 1
)
echo Seeding completed!
echo.

echo ========================================
echo Database setup complete!
echo ========================================
echo.
echo Created:
echo - 6 categories
echo - ~10 sample businesses
echo - 2 test users
echo.
echo Test Accounts:
echo   Admin: admin@tattant.com / admin123
echo   User:  test@example.com / test123
echo.
echo Next steps:
echo   1. cd server
echo   2. npm run dev
echo.
pause
