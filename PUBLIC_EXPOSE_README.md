# Public Exposure Guide

This guide explains how to expose your Canada SaaS application to the public internet with password protection for testing and demos.

## 🆓 Free Alternatives to ngrok

If you prefer free alternatives to ngrok, see **[FREE_TUNNEL_ALTERNATIVES.md](./FREE_TUNNEL_ALTERNATIVES.md)** for options like:
- **Localtunnel** - Easiest, no signup (use `./start-and-expose-localtunnel.sh`)
- **Cloudflare Tunnel** - Best for static domains
- **Serveo** - SSH-based, no installation
- And more!

**Quick start with Localtunnel (no signup, no password):**
```bash
npm install -g localtunnel
./start-and-expose-localtunnel.sh
```

## 🚀 Quick Start (One Command)

The easiest way to start everything and expose it publicly:

```bash
./start-and-expose.sh
```

This single script will:
1. ✅ Start the backend server
2. ✅ Start the frontend server  
3. ✅ Expose both publicly with password protection
4. ✅ Display all access URLs
5. ✅ Save URLs to `.public-urls.txt`

## 📋 Prerequisites

### 1. Install ngrok

**macOS:**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux:**
- Download from: https://ngrok.com/download
- Or use package manager: `sudo snap install ngrok`

**Windows:**
- Download from: https://ngrok.com/download
- Or use Chocolatey: `choco install ngrok`

### 2. Authenticate ngrok

1. Sign up for a free account at: https://dashboard.ngrok.com/signup
2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Run:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

## 🎯 Usage

### Option 1: Start & Expose (Recommended)

**One command to rule them all:**

```bash
./start-and-expose.sh
```

This starts everything and exposes it publicly.

### Option 2: Custom Credentials

Set custom username and password:

```bash
export EXPOSE_AUTH_USER=akramApp
export EXPOSE_AUTH_PASS=akramApp@24Long  # Must be 8-128 characters
./start-and-expose.sh
```

### Option 3: Manual Control

If you want more control, use the individual scripts:

```bash
# Start services manually first
cd backend && ./start.sh &
cd .. && npm run dev &

# Then expose them
./expose-public-ngrok-only.sh
```

## 🔐 Default Credentials

- **Username:** `demo`
- **Password:** `DemoPass123!` (8+ characters required by ngrok)

**Important:** ngrok requires passwords to be between 8 and 128 characters.

You can change these by setting environment variables:
```bash
export EXPOSE_AUTH_USER=yourusername
export EXPOSE_AUTH_PASS=yourpassword123  # Must be 8-128 characters
```

**Note:** If your password is less than 8 characters, the script will show an error and suggest using a longer password.

## 🔑 Three Types of Credentials

### 1. ngrok Basic Auth (For Public URLs)
These credentials protect your exposed URLs:
- **Username:** `demo` (default)
- **Password:** `DemoPass123!` (default)
- **Used for:** Accessing frontend and backend ngrok URLs
- **When prompted:** Browser will ask for these when accessing ngrok URLs

### 2. Frontend Admin Dashboard (For Frontend `/admin`)
This is the React admin interface accessible at `https://your-frontend-url.ngrok-free.dev/admin`:
- **Email/Password:** You create these yourself (NO default credentials)
- **How to create:**
  - **Option A:** Visit the frontend `/admin` page and click "Create Admin Account" (first admin only)
  - **Option B:** Create via Django command (see below)
- **Used for:** Logging into the frontend admin dashboard
- **Note:** The first admin can be created through the UI. After that, you need an existing admin to create more.

### 3. Django Admin Panel (For Backend `/admin`)
This is the Django admin interface accessible at `https://your-backend-url.ngrok-free.dev/admin`:
- **Username/Password:** Same as Frontend Admin (they use the same User model)
- **How to create:** Run `./create-admin-user.sh` or `cd backend && python manage.py createsuperuser`
- **Used for:** Logging into the Django admin panel
- **Note:** You need to create this separately - it's **NOT created automatically**

**Important:** 
- There are **NO default credentials** for admin login
- You must create an admin account first
- The same credentials work for both frontend and backend admin panels
- Save your credentials - you'll need them every time!

## 📍 Access URLs

After running the script, you'll see output like this:

```
════════════════════════════════════════
  🎉 Application is now running and publicly accessible!
════════════════════════════════════════

📍 Access URLs:

  Frontend:    https://abc123.ngrok-free.app
  Backend API:  https://xyz789.ngrok-free.app
  API Docs:     https://xyz789.ngrok-free.app/api/docs
  Admin Panel:  https://xyz789.ngrok-free.app/admin

🔐 Authentication:

  Username: demo
  Password: demo123
```

### What Each URL Does

- **Frontend URL**: Your React application - this is what you share with testers
- **Backend URL**: Django API endpoint (used automatically by frontend)
- **API Docs**: Interactive API documentation (Swagger UI)
- **Admin Panel**: Django admin interface

## 🌐 Local vs Public Access

### Local Access (No Password)
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- No authentication required
- Only accessible on your machine

### Public Access (Password Protected)
- Frontend: `https://[random].ngrok-free.app`
- Backend: `https://[random].ngrok-free.app`
- Requires username/password
- Accessible from anywhere on the internet

## 📝 Saved URLs

All public URLs are automatically saved to `.public-urls.txt`:

```bash
cat .public-urls.txt
```

This file contains:
- Frontend and backend URLs
- Authentication credentials
- Access information

## 🛑 Stopping Services

### Method 1: Keyboard Interrupt
Press `Ctrl+C` in the terminal where the script is running.

### Method 2: Stop Script
```bash
./stop-expose.sh
```

This will stop:
- Backend server
- Frontend server
- ngrok tunnels

## ⚠️ Important Notes

### URL Changes
**⚠️ ngrok free tier URLs change every time you restart!**

- Each time you run the script, you'll get new URLs
- The old URLs will stop working
- Share the new URLs from `.public-urls.txt` after each restart

### Static URLs (Paid Option)
For permanent URLs that don't change:

1. **Upgrade to ngrok paid plan** ($8/month)
2. Reserve a domain in ngrok dashboard
3. Update the script to use your reserved domain

Or use **Cloudflare Tunnel** (free, supports static domains):
```bash
# Install cloudflared
brew install cloudflare/cloudflare/cloudflared

# Login
cloudflared tunnel login

# Use the full script
./expose-public.sh  # This tries Cloudflare first
```

### Security Considerations

1. **Password Protection**: Basic HTTP auth protects your demo
2. **HTTPS**: All ngrok URLs use HTTPS automatically
3. **Temporary**: URLs expire when you stop the script
4. **Not for Production**: This is for testing/demos only

### Frontend API Configuration

The script automatically updates your frontend to use the public backend URL. The frontend will:
- Use the public backend URL for all API calls
- Work seamlessly with the password-protected backend
- Continue working even if you restart (as long as you update the URL)

## 🔧 Troubleshooting

### "ngrok not found"
Install ngrok (see Prerequisites section above).

### "ngrok not authenticated"
Run: `ngrok config add-authtoken YOUR_TOKEN`

### "Port already in use"
Stop the existing service:
```bash
# Find what's using the port
lsof -i :8001  # Backend
lsof -i :5173  # Frontend

# Kill the process
kill -9 <PID>
```

### "Can't connect to ngrok API"
Wait a few seconds after starting ngrok, it takes time to initialize.

### Frontend not connecting to backend
1. Check `.env.local` file exists with correct `VITE_API_URL`
2. Restart the frontend after the script runs
3. Check browser console for errors

### URLs not showing up
1. Check `.ngrok.log` for errors
2. Make sure ngrok is authenticated
3. Try accessing ngrok web interface: http://localhost:4040

## 📚 Available Scripts

| Script | Purpose |
|--------|---------|
| `start-and-expose.sh` | **Start everything + expose** (recommended) |
| `expose-public.sh` | Full-featured expose (tries Cloudflare, falls back to ngrok) |
| `expose-public-ngrok-only.sh` | Simple ngrok-only expose |
| `expose-public.py` | Python version of expose script |
| `stop-expose.sh` | Stop all services and tunnels |

## 🎓 Example Workflow

1. **Start everything:**
   ```bash
   ./start-and-expose.sh
   ```

2. **Copy the URLs** from the output or `.public-urls.txt`

3. **Share with testers:**
   - Send them the Frontend URL
   - Send them the username and password
   - They can access from anywhere!

4. **When done:**
   - Press `Ctrl+C` to stop
   - Or run `./stop-expose.sh`

## 💡 Tips

- **Save the URLs**: The script saves them to `.public-urls.txt` automatically
- **Check logs**: If something goes wrong, check `.backend.log`, `.frontend.log`, or `.ngrok.log`
- **Test locally first**: Make sure everything works on `localhost` before exposing
- **Use strong passwords**: Change the default password for real demos
- **Monitor usage**: Check ngrok dashboard for connection stats

## 🆘 Need Help?

1. Check the logs in `.backend.log`, `.frontend.log`, `.ngrok.log`
2. Verify ngrok is authenticated: `ngrok config check`
3. Test ngrok manually: `ngrok http 8001`
4. Check ngrok web interface: http://localhost:4040

---

**Happy Testing! 🚀**

