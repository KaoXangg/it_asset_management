@echo off
cd /d "%~dp0"

rem Kiểm tra Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js khong ton tai hoac chua duoc cai dat trong PATH.
    echo Vui long cai dat Node.js va chay lai file nay.
    pause
    exit /b 1
)

rem Cai dat dependencies neu chua co
if not exist "%~dp0node_modules" (
    echo [INFO] Cai dat dependencies goc...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Cai dat dependencies goc that bai.
        pause
        exit /b 1
    )
)

if not exist "%~dp0backend\node_modules" (
    echo [INFO] Cai dat dependencies backend...
    cd /d "%~dp0backend"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Cai dat dependencies backend that bai.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

if not exist "%~dp0frontend\node_modules" (
    echo [INFO] Cai dat dependencies frontend...
    cd /d "%~dp0frontend"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Cai dat dependencies frontend that bai.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

echo [INFO] Dang khoi dong backend va frontend...
call npm run dev
