# 🚀 DEPLOYMENT GUIDE — Frontend to DreamHost

## **✅ BUILD COMPLETE!**

The frontend has been built with the correct DreamHost URL configuration:
- ✅ Fixed `api.js` to use `REACT_APP_API_BASE_URL` (not `REACT_APP_API_URL`)
- ✅ Environment variable correctly set to `https://ryanmart.store/api`
- ✅ Production build ready in `frontend/build/`

---

## **THE FIX THAT WAS NEEDED**

There was a bug in `frontend/src/services/api.js` on line 240:

### **❌ BEFORE (WRONG)**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

### **✅ AFTER (CORRECT)**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
```

**Why this mattered:**
- Your `.env` file uses: `REACT_APP_API_BASE_URL=https://ryanmart.store/api`
- But `api.js` was looking for: `REACT_APP_API_URL` (different name!)
- So it always fell back to: `http://localhost:5000/api` ❌
- Now it correctly reads from `.env` ✅

---

## **WHAT'S IN THE BUILD FOLDER**

```
frontend/build/
├── static/
│   ├── js/
│   │   ├── main.1fcd6573.js       ← Contains your app code with DreamHost URL injected ✅
│   │   ├── 299.a164c237.chunk.js
│   │   ├── 558.1bfc078d.chunk.js
│   │   └── 99.a9fff0c1.chunk.js
│   └── css/
│       └── main.c2003d4f.css      ← Styles
├── index.html                      ← Entry point
├── favicon.ico
└── manifest.json                   ← PWA config
```

**File Size:** 424.16 kB (after gzip compression) ✅

---

## **DEPLOYMENT STEPS**

### **Step 1: Connect to DreamHost**

Use FTP or SSH to connect to your DreamHost account:

```bash
# Via SSH (recommended)
ssh username@ryanmart.store
# Enter your DreamHost password

# Or use FTP client like FileZilla:
# Host: ryanmart.store
# Username: your_dreamhost_username
# Password: your_dreamhost_password
```

### **Step 2: Upload the Build Folder**

```bash
# Option A: Via SCP (SSH Copy)
scp -r /home/vincent/money/job-tracking-system/frontend/build/* \
    username@ryanmart.store:/home/yourusername/ryanmart.store/

# Option B: Via SFTP
# In FileZilla:
# 1. Connect to ryanmart.store
# 2. Navigate to public_html/ or your web root
# 3. Upload all files from frontend/build/
```

**Important:** 
- Upload the **contents** of `build/` (not the `build/` folder itself)
- Your files should be at: `https://ryanmart.store/index.html`

### **Step 3: Configure Web Server (DreamHost Panel)**

In DreamHost control panel:
1. Go to **Domains** → **Manage Domains**
2. Click **Edit** next to `ryanmart.store`
3. Set **Web Root** to `/home/yourusername/ryanmart.store/`
4. Ensure **Directory Listing** is OFF
5. Save changes

### **Step 4: Verify the Build Was Uploaded**

```bash
# Connect via SSH and check:
ssh username@ryanmart.store
ls -la /home/yourusername/ryanmart.store/

# You should see:
# index.html
# static/
# favicon.ico
# manifest.json
```

---

## **TESTING THE DEPLOYMENT**

### **Test 1: Open the Frontend**
```
1. Open: https://ryanmart.store
2. Should see login page
3. ✅ Page loads without errors
```

### **Test 2: Verify API Connection**
```
1. Open: https://ryanmart.store
2. Press F12 (Developer Tools)
3. Go to Network tab
4. Try to login
5. Look for a request to: https://ryanmart.store/api/auth/login
6. ✅ Should see successful 200-201 response
```

### **Test 3: Check the Build Configuration**
```
1. Open: https://ryanmart.store
2. Press F12 → Console tab
3. Type: fetch('/api/auth/me').then(r => r.json()).then(console.log)
4. ✅ Should make request to https://ryanmart.store/api/auth/me
```

### **Test 4: Full Login Flow**
```
1. Open: https://ryanmart.store
2. Login with valid credentials (from backend database)
3. ✅ Should redirect to dashboard
4. ✅ All data should load (sales, purchases, stock, etc.)
```

---

## **TROUBLESHOOTING**

### **Issue: Still seeing "localhost:5000" in Network tab**

**Cause:** Old build still deployed or browser cache

**Fix:**
```bash
# 1. Delete old files from DreamHost:
ssh username@ryanmart.store
rm -rf /home/yourusername/ryanmart.store/*

# 2. Re-upload build/ contents (Step 2 above)

# 3. Clear browser cache:
Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
```

### **Issue: "ERR_CONNECTION_REFUSED" or "Network Error"**

**Cause:** Backend might not be running or firewall blocked

**Fix:**
```bash
# 1. Check backend is running:
# On your backend server, verify Flask app is running
# Check: http://ryanmart.store:5000/api/health (if exposed)

# 2. If backend is on different server, check CORS settings
# Backend config should allow requests from https://ryanmart.store

# 3. Test directly:
curl -X POST https://ryanmart.store/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### **Issue: CORS errors (Access-Control-Allow-Origin)**

**This shouldn't happen if backend allows requests from https://ryanmart.store**

**Fix:**
```python
# In backend/config.py or app.py, ensure:
from flask_cors import CORS

CORS(app, origins=[
    'https://ryanmart.store',
    'http://localhost:3000',  # For dev
    'http://localhost:5000'   # For testing
])
```

### **Issue: 404 Not Found on page reload**

**Cause:** Web server not configured for React Router

**Fix:** Create `.htaccess` file in your web root:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## **ENVIRONMENT VARIABLES USED**

### **In `.env` file (injected at build time)**
```properties
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

### **Fallback in code (if env var not set)**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
```

**How it works:**
1. At build time: `npm run build`
2. Webpack reads `.env` file
3. Injects value into JavaScript bundle
4. All API calls use: `https://ryanmart.store/api`

---

## **VERIFICATION CHECKLIST**

- [ ] `.env` file exists with correct URL: `REACT_APP_API_BASE_URL=https://ryanmart.store/api`
- [ ] `api.js` uses `REACT_APP_API_BASE_URL` (not `REACT_APP_API_URL`)
- [ ] `npm run build` completed successfully with 0 errors
- [ ] `frontend/build/` folder created with ~424KB size
- [ ] Build files uploaded to DreamHost web root
- [ ] Frontend accessible at https://ryanmart.store
- [ ] Network tab shows requests to `https://ryanmart.store/api/*`
- [ ] Login works without "localhost:5000" errors
- [ ] Dashboard loads and displays data

---

## **NEXT STEPS**

1. **Upload build to DreamHost** (Step 2 above)
2. **Test login** (Testing section above)
3. **Monitor errors** (F12 → Console tab)
4. **Test all features:**
   - Create sales entry
   - Create purchase entry
   - View stock tracking
   - Download reports
   - Change password
   - Manage users (if admin)

---

## **SUMMARY OF CHANGES**

| File | Change | Reason |
|------|--------|--------|
| `frontend/.env` | `REACT_APP_API_BASE_URL=https://ryanmart.store/api` | Centralized config |
| `frontend/src/services/api.js` | Changed `REACT_APP_API_URL` → `REACT_APP_API_BASE_URL` | Match `.env` variable name |
| `frontend/src/contexts/AuthContext.jsx` | Uses `api.post('/auth/login')` | No hardcoding |
| 14+ component files | Use relative `/api/...` paths | Dynamic base URL |

---

## **IMPORTANT NOTES**

🔒 **Security:**
- Never commit `.env` file with real URLs to public repos
- Create `.gitignore` entry: `frontend/.env` (not `.env.example`)
- Use environment-specific configs (dev, staging, prod)

⚡ **Performance:**
- Build file is ~424KB gzipped (good)
- Static hosting on DreamHost is fast
- Consider CDN in future for global distribution

🔄 **Updates:**
- To update frontend: `npm run build` → re-upload `build/` folder
- No backend changes needed for frontend updates
- Backend API URL never changes (hardcoded in backend config)

---

## **QUICK REFERENCE**

```bash
# Build command
cd /home/vincent/money/job-tracking-system/frontend
npm run build

# Test backend connection
curl https://ryanmart.store/api/auth/me

# SSH into DreamHost
ssh username@ryanmart.store

# Upload to DreamHost (from local machine)
scp -r frontend/build/* username@ryanmart.store:/path/to/webroot/
```

---

**Status:** ✅ Ready for deployment  
**Backend:** https://ryanmart.store/api  
**Frontend:** Ready to upload (frontend/build/)  
**Date:** November 29, 2025
