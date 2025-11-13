# Free Alternatives to ngrok

Here are the best free alternatives to ngrok for exposing your local development server:

## 🏆 Top Free Alternatives

### 1. **Cloudflare Tunnel (cloudflared)** ⭐ Recommended
**Best for:** Static domains, production-like setup

- ✅ **100% Free** with static domains
- ✅ **No bandwidth limits**
- ✅ **HTTPS by default**
- ✅ **Supports custom domains**
- ✅ **Very reliable**

**Installation:**
```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

**Setup:**
```bash
# Login (one-time setup)
cloudflared tunnel login

# Create a tunnel
cloudflared tunnel create my-tunnel

# Run tunnel
cloudflared tunnel run my-tunnel
```

**Pros:**
- Free static domains
- Enterprise-grade infrastructure
- No rate limits
- Great for demos and production

**Cons:**
- Requires Cloudflare account (free)
- Slightly more setup

---

### 2. **Localtunnel** ⭐ Easiest
**Best for:** Quick testing, no signup needed

- ✅ **100% Free**
- ✅ **No signup required**
- ✅ **Super easy to use**
- ✅ **Custom subdomains**

**Installation:**
```bash
npm install -g localtunnel
```

**Usage:**
```bash
# Expose port 5173 (frontend)
lt --port 5173 --subdomain myapp

# Expose port 8001 (backend)
lt --port 8001 --subdomain myapi
```

**Pros:**
- Easiest to use
- No account needed
- Custom subdomains
- Works immediately

**Cons:**
- URLs change each time (unless you use custom subdomain)
- Less reliable than Cloudflare
- No built-in authentication

---

### 3. **Serveo** (SSH-based)
**Best for:** Quick testing, no installation

- ✅ **100% Free**
- ✅ **No installation** (uses SSH)
- ✅ **No signup**

**Usage:**
```bash
# Expose port 5173
ssh -R 80:localhost:5173 serveo.net

# With custom subdomain
ssh -R myapp:80:localhost:5173 serveo.net
```

**Pros:**
- No installation needed
- Uses built-in SSH
- Free

**Cons:**
- Less reliable
- URLs can change
- No authentication built-in

---

### 4. **localhost.run** (SSH-based)
**Best for:** Quick SSH-based tunneling

- ✅ **100% Free**
- ✅ **No installation**
- ✅ **Persistent URLs** (with account)

**Usage:**
```bash
# Without account (temporary URL)
ssh -R 80:localhost:5173 ssh.localhost.run

# With account (persistent URL)
ssh -R myapp:80:localhost:5173 ssh.localhost.run
```

---

### 5. **Bore** (Open Source)
**Best for:** Self-hosted option

- ✅ **100% Free & Open Source**
- ✅ **Simple and fast**
- ✅ **Written in Rust**

**Installation:**
```bash
# macOS
brew install bore-cli

# Or download from: https://github.com/ekzhang/bore
```

**Usage:**
```bash
bore local 5173 --to bore.pub
```

---

## 📊 Comparison

| Tool | Free | Static URLs | Auth Support | Ease of Use | Reliability |
|------|------|-------------|--------------|-------------|-------------|
| **Cloudflare Tunnel** | ✅ | ✅ | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Localtunnel** | ✅ | ⚠️ (custom subdomain) | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Serveo** | ✅ | ⚠️ (with account) | ❌ | ⭐⭐⭐⭐ | ⭐⭐ |
| **localhost.run** | ✅ | ⚠️ (with account) | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Bore** | ✅ | ❌ | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Recommendations

### For Quick Testing:
- **Localtunnel** - Easiest, no setup needed

### For Demos/Production:
- **Cloudflare Tunnel** - Best reliability, static domains

### For No Installation:
- **Serveo** or **localhost.run** - Use SSH directly

## 🔧 Adding Authentication

Most free alternatives don't have built-in authentication. You can add it using:

1. **nginx reverse proxy** with basic auth
2. **Apache** with basic auth
3. **Custom middleware** in your app

## 💡 Quick Start with Localtunnel

```bash
# Install
npm install -g localtunnel

# Expose frontend
lt --port 5173 --subdomain myapp-frontend

# Expose backend (in another terminal)
lt --port 8001 --subdomain myapp-backend
```

## 💡 Quick Start with Cloudflare Tunnel

```bash
# Install
brew install cloudflare/cloudflare/cloudflared

# Login (one-time)
cloudflared tunnel login

# Create and run tunnel
cloudflared tunnel --url http://localhost:5173
```

---

**Note:** For our script, we recommend **Cloudflare Tunnel** for the best experience, or **Localtunnel** for the easiest setup.

