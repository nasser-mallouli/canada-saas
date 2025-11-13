# Cloudflare Tunnel Setup Guide

When using Cloudflare Tunnel, you need to expose **both** the frontend and backend separately, as Cloudflare Tunnel domains don't support port numbers.

## Quick Setup

### Option 1: Expose Both Services (Recommended)

Expose both frontend and backend using separate Cloudflare Tunnel commands:

```bash
# Terminal 1: Expose Frontend
cloudflared tunnel --url http://localhost:5173

# Terminal 2: Expose Backend  
cloudflared tunnel --url http://localhost:8001
```

You'll get two URLs:
- Frontend: `https://xxxxx.trycloudflare.com`
- Backend: `https://yyyyy.trycloudflare.com`

Then set the backend URL in your frontend:

```bash
# Create .env.local file in project root
echo "VITE_API_URL=https://yyyyy.trycloudflare.com" > .env.local
```

**Important:** Restart your Vite dev server after creating `.env.local`:
```bash
# Stop current server (Ctrl+C) and restart
npm run dev
```

### Option 2: Use the Automated Script

Use the `expose-public.sh` script which handles both frontend and backend:

```bash
./expose-public.sh
```

This script will:
1. Start both frontend and backend
2. Expose both via Cloudflare Tunnel
3. Automatically configure the frontend to use the backend URL

### Option 3: Manual Configuration

If you've already started Cloudflare Tunnel for frontend only:

1. **Get your backend Cloudflare Tunnel URL:**
   ```bash
   # In a new terminal, expose backend
   cloudflared tunnel --url http://localhost:8001
   # Copy the URL it gives you (e.g., https://yyyyy.trycloudflare.com)
   ```

2. **Set the backend URL:**
   ```bash
   # Create or update .env.local
   echo "VITE_API_URL=https://yyyyy.trycloudflare.com" > .env.local
   ```

3. **Restart Vite dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Update backend CORS settings:**
   Make sure your backend allows the frontend Cloudflare domain:
   ```bash
   cd backend
   source venv/bin/activate
   export ALLOWED_HOSTS="*"
   export CORS_ALLOW_ALL_ORIGINS="True"
   export CSRF_TRUSTED_ORIGINS="https://xxxxx.trycloudflare.com"
   python manage.py runserver 0.0.0.0:8001
   ```

## Troubleshooting

### Frontend can't reach backend

1. **Check if backend is exposed:**
   - Make sure you have a separate Cloudflare Tunnel running for port 8001
   - Test the backend URL directly in browser: `https://your-backend-url.trycloudflare.com/api/docs`

2. **Check environment variable:**
   ```bash
   cat .env.local
   # Should show: VITE_API_URL=https://your-backend-url.trycloudflare.com
   ```

3. **Restart Vite dev server:**
   - Environment variables are only loaded when Vite starts
   - Stop and restart: `npm run dev`

### CORS errors

If you see CORS errors, make sure your backend has:
```bash
export CORS_ALLOW_ALL_ORIGINS="True"
export ALLOWED_HOSTS="*"
```

### Buttons/API calls not working

1. Check browser console for errors
2. Verify backend URL is correct in `.env.local`
3. Make sure backend Cloudflare Tunnel is running
4. Test backend URL directly: `https://your-backend-url.trycloudflare.com/api/docs`

## Alternative: Use Localtunnel

If Cloudflare Tunnel is too complex, use Localtunnel which handles both services automatically:

```bash
./start-and-expose-localtunnel.sh
```

This script automatically:
- Exposes both frontend and backend
- Configures the frontend to use the backend URL
- Handles all CORS and CSRF settings

