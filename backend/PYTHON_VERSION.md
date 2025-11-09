# Python Version Compatibility

## ⚠️ Important: Python Version Requirement

**Use Python 3.11 or 3.12** (not 3.14) due to `django-ninja-jwt` compatibility issues.

### The Problem

`django-ninja-jwt` uses Pydantic v1, which is **not compatible with Python 3.14+**. You'll see this error:

```
pydantic.v1.errors.ConfigError: unable to infer type for attribute "AUDIENCE"
```

### Solution

1. **Install Python 3.11 or 3.12:**

   ```bash
   # Using pyenv (recommended)
   pyenv install 3.11.9
   pyenv local 3.11.9
   
   # Or using pyenv install 3.12.7
   pyenv install 3.12.7
   pyenv local 3.12.7
   ```

2. **Recreate virtual environment:**

   ```bash
   cd backend
   rm -rf venv
   python3.11 -m venv venv  # or python3.12
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Verify Python version:**

   ```bash
   python --version  # Should show 3.11.x or 3.12.x
   ```

### Alternative: Use Docker

If you prefer, use Docker which will use the correct Python version:

```bash
docker-compose up --build
```

The Dockerfile uses Python 3.11, which is compatible.

### Why This Happens

- `django-ninja-jwt` depends on Pydantic v1
- Pydantic v1 doesn't support Python 3.14+
- Python 3.14 was released recently and many packages haven't updated yet

### Recommended Python Versions

- ✅ **Python 3.11** - Stable, well-tested
- ✅ **Python 3.12** - Latest stable, good compatibility
- ❌ **Python 3.14** - Too new, compatibility issues

