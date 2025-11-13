# Setting Up on a New Machine

This guide helps you set up the Canada SaaS application on a new computer or server.

## 🚀 Quick Setup (Automated)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd canada-saas
```

### Step 2: Set Up Database
```bash
./setup-database.sh
```

This script will:
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Create database migrations
- ✅ Apply migrations (create all tables)

### Step 3: Create Admin User (Required for /admin access)
```bash
./create-admin-user.sh
```

**Important:** This creates the Django superuser account. You'll be prompted to enter:
- **Username** (e.g., `admin` or your email)
- **Email address** (optional)
- **Password** (enter twice)

**Save these credentials** - you'll need them to log into `/admin`!

### Step 4: Start the Application
```bash
./start-and-expose.sh
```

That's it! 🎉

---

## 📋 Manual Setup (Step by Step)

If you prefer to set up manually or the automated script doesn't work:

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3.11 -m venv venv  # or python3.12
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Create migrations:**
   ```bash
   python manage.py makemigrations core
   ```

5. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start backend:**
   ```bash
   python manage.py runserver 8001
   ```

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..  # if you're in backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

---

## 🔍 Verify Setup

### Check Database Tables
```bash
cd backend
source venv/bin/activate
python manage.py showmigrations core
```

You should see all migrations marked with `[X]` (applied).

### Check Backend
```bash
curl http://localhost:8001/api/docs
```

Should return the API documentation page.

### Check Frontend
```bash
curl http://localhost:5173
```

Should return the React app.

---

## 🗄️ Database Information

### Default Database
- **Type:** SQLite
- **Location:** `backend/db.sqlite3`
- **Note:** This file is created automatically on first migration

### Using PostgreSQL (Optional)
If you want to use PostgreSQL instead:

1. **Install PostgreSQL:**
   ```bash
   # macOS
   brew install postgresql
   
   # Linux
   sudo apt install postgresql
   ```

2. **Create database:**
   ```bash
   createdb canada_saas
   ```

3. **Update backend/.env:**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/canada_saas
   ```

4. **Run migrations:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py migrate
   ```

---

## 🐛 Troubleshooting

### "No module named 'django'"
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Database is locked" (SQLite)
- Close any other connections to the database
- Restart the backend server
- If persistent, delete `backend/db.sqlite3` and run migrations again

### "Migration conflicts"
```bash
cd backend
source venv/bin/activate
python manage.py makemigrations core
python manage.py migrate
```

### "Port already in use"
```bash
# Find what's using the port
lsof -i :8001  # Backend
lsof -i :5173  # Frontend

# Kill the process
kill -9 <PID>
```

---

## 📝 Environment Variables

### Backend (.env file in backend/)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=  # Leave empty for SQLite
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env file in root/)
```env
VITE_API_URL=http://localhost:8001
```

---

## ✅ Checklist for New Machine

- [ ] Python 3.11 or 3.12 installed
- [ ] Node.js 20+ installed
- [ ] Repository cloned
- [ ] Database set up (`./setup-database.sh`)
- [ ] Admin user created (`./create-admin-user.sh`)
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Can access http://localhost:8001/api/docs
- [ ] Can access http://localhost:5173

---

## 🚀 Quick Commands Reference

```bash
# Set up everything
./setup-database.sh

# Create admin user
./create-admin-user.sh

# Start and expose publicly
./start-and-expose.sh

# Start locally only
cd backend && ./start.sh
npm run dev

# Check migration status
cd backend && source venv/bin/activate
python manage.py showmigrations core
```

---

**Need help?** Check the main [README.md](./README.md) or [PUBLIC_EXPOSE_README.md](./PUBLIC_EXPOSE_README.md)

