@echo off
REM Windows startup script for Canada SaaS Backend

echo Starting Canada SaaS Backend...
echo.

REM Check for Python 3.11
python --version 2>nul | findstr /R "3.1[12]" >nul
if %errorlevel% equ 0 (
    echo Found compatible Python version
    goto :setup
)

REM Try python3.11 explicitly
python3.11 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3.11
    goto :setup
)

REM Try python3.12 explicitly
python3.12 --version >nul 2>&1
if %errorlevel% equ 0 (
    set PYTHON_CMD=python3.12
    goto :setup
)

echo ERROR: Python 3.11 or 3.12 not found!
echo Please install Python 3.11 or 3.12
pause
exit /b 1

:setup
if not defined PYTHON_CMD set PYTHON_CMD=python

echo Setting up virtual environment...
if not exist venv (
    %PYTHON_CMD% -m venv venv
)

call venv\Scripts\activate.bat

echo Installing dependencies...
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo Running migrations...
python manage.py makemigrations core
python manage.py migrate

echo.
echo Setup complete!
echo.
echo Starting Django development server...
echo Backend API: http://localhost:8001
echo API Docs: http://localhost:8001/api/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 8001

