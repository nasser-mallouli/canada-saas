# How to Use Canada SaaS - Complete Setup Guide for Beginners

This guide will help you set up and run the Canada SaaS application, even if you have no programming experience. We'll cover everything from installing Python and Node.js to running both the frontend and backend.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installing Python (macOS & Windows)](#installing-python)
3. [Installing Node.js & npm (macOS & Windows)](#installing-nodejs--npm)
4. [Setting up the Backend](#setting-up-the-backend)
5. [Setting up the Frontend](#setting-up-the-frontend)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before we begin, you'll need:
- A computer running macOS or Windows
- Internet connection
- Administrator rights to install software (if needed)
- About 1-2 GB of free disk space

## Installing Python

### For macOS:

**Option 1: Using Homebrew (Recommended)**
1. Open Terminal (Applications > Utilities > Terminal)
2. Install Homebrew if you don't have it:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Install Python 3.11 or 3.12:
   ```bash
   brew install python@3.11
   ```
   OR
   ```bash
   brew install python@3.12
   ```

**Option 2: Direct Download**
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12 (NOT 3.14)
3. Run the installer and follow the setup wizard
4. Make sure to check "Add Python to PATH" during installation

### For Windows:

1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12 (NOT 3.14)
3. Run the installer
4. **Important**: Check "Add Python to PATH" during installation
5. Click "Install Now"

### Verify Installation
Open Terminal (macOS) or Command Prompt (Windows) and run:
```bash
python --version
```
or
```bash
python3 --version
```
You should see Python 3.11.x or 3.12.x

## Installing Node.js & npm

### For macOS:

**Option 1: Using Homebrew (Recommended)**
1. Open Terminal
2. Run:
   ```bash
   brew install node
   ```

**Option 2: Direct Download**
1. Go to https://nodejs.org/
2. Download the LTS version
3. Run the installer and follow the setup wizard

### For Windows:

1. Go to https://nodejs.org/
2. Download the LTS version
3. Run the installer
4. Keep default settings and click "Next" through the installation

### Verify Installation
Open Terminal (macOS) or Command Prompt (Windows) and run:
```bash
node --version
npm --version
```
You should see version numbers for both.

## Setting up the Backend

### 1. Download the Project
1. Go to https://github.com/nassermallouli/canada-saas
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to a folder on your computer (e.g., Documents/canada-saas)

### 2. Navigate to the Backend Directory
**For macOS:**
1. Open Terminal
2. Navigate to the backend directory:
   ```bash
   cd /path/to/your/canada-saas/backend
   ```
   (Replace "/path/to/your/canada-saas" with the actual path where you extracted the files)

**For Windows:**
1. Open Command Prompt
2. Navigate to the backend directory:
   ```cmd
   cd C:\path\to\your\canada-saas\backend
   ```
   (Replace "C:\path\to\your\canada-saas" with the actual path where you extracted the files)

### 3. Create a Virtual Environment
**For macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**For Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

### 4. Install Backend Dependencies
Make sure you're still in the backend directory and your virtual environment is activated, then run:
```bash
pip install -r requirements.txt
```

### 5. Create and Configure Environment File
1. In the backend directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   **For Windows:**
   ```cmd
   copy .env.example .env
   ```

2. Open the `.env` file in a text editor (like TextEdit on macOS or Notepad on Windows)

3. You'll see:
   ```
   OPENROUTER_API1=
   ```
   
   If you have an OpenRouter API key, add it after the `=` sign. If not, leave it blank for now.

4. Also add these lines to the `.env` file:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=  # Leave empty for SQLite
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

### 6. (Optional) Setting up OpenRouter API
The application uses OpenRouter to provide AI-powered immigration advice. To use this feature:

**Getting an OpenRouter API Key:**
1. Go to https://openrouter.ai/
2. Click "Sign Up" in the top right corner
3. Create an account using your email or social login
4. Once logged in, go to "Keys" (in the left sidebar or user menu)
5. Click "Create Key" to generate a new API key
6. Copy the generated key (it will look something like "sk-or-v1-...")

**Using Your OpenRouter API Key:**
1. In your `.env` file, add your API key:
   ```
   OPENROUTER_API1=your_actual_api_key_here
   ```
   (Replace "your_actual_api_key_here" with the key you copied from OpenRouter)

2. You can also customize the AI model if desired (default is 'minimax/minimax-m2:free'):
   ```
   OPENROUTER_MODEL=minimax/minimax-m2:free
   ```

**Note:** OpenRouter offers a free tier with limited requests per month. If you don't set up an API key, the AI features will be disabled, but the rest of the application will still work.

**Important:** Keep your API key private and secure. Don't share it publicly or commit it to version control.

## Setting up the Frontend

### 1. Navigate to the Project Root Directory
**For macOS:**
```bash
cd /path/to/your/canada-saas
```

**For Windows:**
```cmd
cd C:\path\to\your\canada-saas
```

### 2. Install Frontend Dependencies
Make sure you're in the project root directory (the main canada-saas folder), then run:
```bash
npm install
```

### 3. Create Frontend Environment File
1. In the main canada-saas directory, create a `.env` file
2. Add the following content:
   ```
   VITE_API_URL=http://localhost:8001
   ```

## Running the Application

### 1. Start the Backend Server
1. Make sure you're in the backend directory
2. Make sure your virtual environment is activated:
   **macOS:**
   ```bash
   source venv/bin/activate
   ```
   **Windows:**
   ```cmd
   venv\Scripts\activate
   ```

3. Run the backend:
   **Option 1: Using the smart startup script (recommended):**
   ```bash
   ./start.sh
   ```
   **For Windows, use Command Prompt or Git Bash:**
   ```cmd
   bash start.sh
   ```

   **Option 2: Manual start:**
   ```bash
   python manage.py runserver 8001
   ```

4. Keep this terminal/command prompt window open. You should see messages indicating the server is running.

### 2. Start the Frontend Server
1. Open a **new** Terminal/Command Prompt window
2. Navigate to the project root directory:
   **macOS:**
   ```bash
   cd /path/to/your/canada-saas
   ```
   **Windows:**
   ```cmd
   cd C:\path\to\your\canada-saas
   ```

3. Run the frontend:
   ```bash
   npm run dev
   ```

4. Keep this window open too. You should see a message with a local address like `http://localhost:5173`

### 3. Access the Application
1. Open your web browser
2. Go to `http://localhost:5173`
3. The application should now be running!

## Alternative: Using Docker (Advanced)

If you have Docker installed, you can run the entire application with one command:

1. Install Docker Desktop:
   - For macOS: https://desktop.docker.com/mac/main/amd64/Docker.dmg
   - For Windows: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. Navigate to the project root directory in Terminal/Command Prompt

3. Run:
   ```bash
   docker-compose up --build
   ```

4. Access the application at `http://localhost:5173`

## Troubleshooting

### Common Issues and Solutions:

**Issue: "python" command not found**
- Make sure Python is installed and added to PATH
- Try using "python3" instead of "python" on macOS

**Issue: "pip" command not found**
- Make sure Python is installed correctly
- Try running `python -m pip` instead of `pip`

**Issue: Permission errors on macOS**
- You might need to run commands with `sudo` (e.g., `sudo pip install`)
- Or configure proper permissions for your user

**Issue: Port already in use**
- The backend runs on port 8001 and frontend on 5173
- If these ports are in use, you might need to stop other applications using them

**Issue: Node.js/npm not found**
- Close and reopen Terminal/Command Prompt
- Make sure Node.js was installed with "Add to PATH" option

**Issue: Backend won't start**
- Make sure you're in the backend directory
- Make sure virtual environment is activated
- Make sure Python 3.11 or 3.12 is installed (not 3.14)

**Issue: Frontend won't start**
- Make sure you're in the project root directory
- Make sure backend is running before starting frontend

**Issue: Can't connect to backend from frontend**
- Make sure both servers are running
- Check that the `VITE_API_URL` in frontend `.env` points to `http://localhost:8001`

**Issue: AI features not working or showing errors**
- Check if you have an OpenRouter API key configured in your `.env` file
- If not, the AI features will be disabled but other functionality should still work
- Make sure your OpenRouter API key is correctly formatted (starts with "sk-or-v1-")
- Check your OpenRouter account for any usage limits or billing issues

**Issue: Error message about "OpenRouter API key is not configured"**
- This is just an informational message if you don't have an API key
- The application will work without the AI features if you don't configure OpenRouter
- To enable AI features, follow the instructions in the "Setting up the Backend" section

## Getting Help

If you encounter issues not covered in this guide:
1. Make sure you followed all steps exactly as written
2. Check that you're in the correct directory for each command
3. Ensure all prerequisites are properly installed
4. Try restarting your computer and repeating the steps

For additional help, you can create an issue on the GitHub repository or contact the project maintainers.