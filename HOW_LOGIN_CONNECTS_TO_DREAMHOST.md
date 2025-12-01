# 📋 LOGIN CONNECTION DETAILS — How It Connects to DreamHost

## **THE ANSWER TO YOUR QUESTION:**
### "Tell me details on how it is connected to localhost and how to change it to DreamHost"

---

## **BEFORE: How It Connected to Localhost ❌**

If you had the OLD code, login files connected to localhost like this:

```javascript
// BEFORE (BAD) — Multiple files had hardcoded localhost:

// 1. OtherExpenseForm.jsx (Line 26)
fetch('http://localhost:5000/api/other_expenses', {...})

// 2. SalesTab.jsx (Line 54)  
fetch(`http://127.0.0.1:5000/api/sales/report/${dateStr}`, {...})

// 3. AuthContext.tsx (Line 72) — IF IT HAD BEEN HARDCODED
fetch('http://127.0.0.1:5000/api/auth/login', {...})

// 4. SellerDashboard.jsx (Lines 16, 47, 83)
const BASE_URL = 'http://127.0.0.1:5000/api';
fetch(`${BASE_URL}/assignments?seller=${emailOrName}`, {...})
fetch(`${BASE_URL}/sales/clear?seller=${emailOrName}`, {...})
fetch('http://localhost:5000/api/other_expenses', {...})
```

### **Problem with Localhost:**
- ❌ Every file had its own hardcoded URL
- ❌ Can't switch to production without code changes
- ❌ Inconsistent (some use `localhost`, some use `127.0.0.1`)
- ❌ No way to use `.env` for different environments

---

## **NOW: How It Connects to DreamHost ✅**

Your code NOW connects to DreamHost like this:

### **Step 1: Frontend .env File**
```bash
frontend/.env
```
**Contents:**
```properties
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```
✅ This is the **single source of truth** for backend URL

---

### **Step 2: Axios Setup (api.js)**
```javascript
// frontend/src/api/api.js (Line 5-6)

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  // ↑ Reads from .env file above
});
```

✅ This **one place** controls baseURL for ALL API calls

---

### **Step 3: Login Code (AuthContext.tsx)**
```typescript
// frontend/src/contexts/AuthContext.tsx (Line 71)

const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    //                           ↑
    //                    No hardcoded URL!
    //                    Uses api instance above ↑
    
    // axios automatically prepends baseURL:
    // POST https://ryanmart.store/api/auth/login
```

✅ Login endpoint is **clean and flexible**

---

## **THE CONNECTION PATH**

```
┌──────────────────┐
│  frontend/.env   │  REACT_APP_API_BASE_URL=https://ryanmart.store/api
└────────┬─────────┘
         │ (React reads at build time)
         ↓
┌──────────────────────────────┐
│  frontend/src/api/api.js     │  baseURL: process.env.REACT_APP_API_BASE_URL
│  (axios instance)            │
└────────┬──────────────────────┘
         │ (Used by all components)
         ↓
┌──────────────────────────────┐
│  AuthContext.tsx             │  api.post('/auth/login', {...})
│  (login code)                │
└────────┬──────────────────────┘
         │ (Automatically prepends baseURL)
         ↓
┌──────────────────────────────┐
│  FINAL REQUEST:              │  https://ryanmart.store/api/auth/login
│  (Sent to DreamHost)         │
└──────────────────────────────┘
```

---

## **ALL FILES INVOLVED IN LOGIN**

### **1. Configuration Files**
| File | Purpose |
|------|---------|
| `frontend/.env` | **✅ DreamHost URL stored here** |
| `frontend/.env.local` | Optional override for local dev |

### **2. API Layer**
| File | Role |
|------|------|
| `frontend/src/api/api.js` | ✅ **Axios setup (reads .env)** |
| `frontend/src/api/dashboard.js` | Exports `useDashboardData` hook |
| `frontend/src/api/sales.js` | Uses `api` for sales endpoints |
| `frontend/src/api/purchase.js` | Uses `api` for purchase endpoints |

### **3. Authentication Context**
| File | Role |
|------|------|
| `frontend/src/contexts/AuthContext.tsx` | ✅ **Login logic (uses api.post)** |

### **4. UI Components Using Auth**
| File | Login Usage |
|------|------------|
| `frontend/src/pages/Dashboard.jsx` | Imports `useAuth` for user data |
| `frontend/src/pages/SellerDashboard.jsx` | Imports `useAuth`, uses api calls |
| `frontend/src/pages/DriverDashboard.jsx` | Imports `useAuth` |
| `frontend/src/pages/StoreKeeperDashboard.jsx` | Imports `useAuth` |
| `frontend/src/pages/PurchaserDashboard.jsx` | Imports `useAuth` |
| `frontend/src/components/*.jsx` | Import `useAuth` to check login status |

---

## **BEFORE vs AFTER COMPARISON**

### **BEFORE ❌ (Hardcoded Localhost)**
```javascript
// 5+ different files had this problem:
const BASE_URL = 'http://127.0.0.1:5000/api';
// or
const API_BASE_URL = 'http://localhost:5000/api';
// or  
fetch('http://localhost:5000/api/other_expenses', {...})
```

**Issues:**
- Must edit 5+ files to change environment
- Can't use same code for dev + production
- Easy to miss a file
- No version control friendly

---

### **AFTER ✅ (Single .env File)**
```javascript
// ONE file controls everything:
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

**Benefits:**
- ✅ Single place to change backend URL
- ✅ All files auto-read from .env
- ✅ Works for dev, staging, production
- ✅ Different .env files per environment
- ✅ Version control friendly (don't commit secrets)

---

## **HOW THE LOGIN REQUEST ACTUALLY WORKS**

### **Detailed Flow:**

```
1. User opens https://ryanmart.store
   ↓
2. React app loads from DreamHost
   - Reads frontend/.env
   - Builds axios instance with baseURL: https://ryanmart.store/api
   ↓
3. User clicks "Login" button
   ↓
4. AuthContext.login(email, password) called
   ↓
5. api.post('/auth/login', {email, password})
   ↓
6. axios interceptor checks: Do we have a token? No (first login)
   ↓
7. axios sends request:
   METHOD: POST
   URL: https://ryanmart.store/api/auth/login  ← baseURL prepended
   HEADERS: {
     'Content-Type': 'application/json',
     'Accept': 'application/json'
   }
   BODY: { email: 'user@example.com', password: 'secret' }
   ↓
8. Request travels over HTTPS to DreamHost
   ↓
9. DreamHost Flask backend receives request at:
   POST /api/auth/login
   ↓
10. Backend validates credentials
    - Checks user exists
    - Checks password correct
    - Generates JWT token
    ↓
11. Backend sends response:
    {
      "success": true,
      "data": {
        "user": { id: "123", email: "user@example.com", role: "seller", ... },
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
    ↓
12. Frontend receives response
    ↓
13. AuthContext.tsx saves to localStorage:
    localStorage.setItem('fruittrack_user', JSON.stringify(user))
    localStorage.setItem('access_token', token)
    localStorage.setItem('refresh_token', refreshToken)
    ↓
14. UI updates: user now logged in ✅
    ↓
15. All future requests include:
    Authorization: Bearer <access_token>
    ↓
16. DreamHost backend validates token in every request
    ↓
17. User can access dashboard, sales, purchases, etc. ✅
```

---

## **WHAT HAPPENS AFTER LOGIN**

Once user is logged in, **EVERY** API request automatically includes the token:

```javascript
// In frontend/src/api/api.js (Line 18-22):
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    //                              ↑
    //                    Auto-added to ALL requests
  }
  return config;
});
```

**Examples of requests with token:**
```javascript
api.get('/sales')
→ GET https://ryanmart.store/api/sales
→ Header: Authorization: Bearer eyJhbGc...

api.post('/purchases', data)
→ POST https://ryanmart.store/api/purchases
→ Header: Authorization: Bearer eyJhbGc...

api.get('/users/profile')
→ GET https://ryanmart.store/api/users/profile
→ Header: Authorization: Bearer eyJhbGc...
```

---

## **IF TOKEN EXPIRES**

Axios auto-refreshes it:

```javascript
// In api.js (Line 40-65):
if (error.response?.status === 401) {  // Token expired
  // Auto-refresh token:
  api.post('/auth/refresh', {
    refresh_token: localStorage.getItem('refresh_token')
  })
  // Get new access token from DreamHost
  // Retry original request with new token
}
```

---

## **VERIFICATION CHECKLIST**

### **Check 1: .env File**
```bash
cat frontend/.env
# Should show:
# REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

### **Check 2: api.js Configuration**
```bash
grep -A 2 "baseURL:" frontend/src/api/api.js
# Should show:
# baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
```

### **Check 3: AuthContext Login**
```bash
grep -A 5 "api.post('/auth/login'" frontend/src/contexts/AuthContext.tsx
# Should show:
# const response = await api.post('/auth/login', { email, password });
```

### **Check 4: No Hardcoded Localhost**
```bash
grep -r "http://localhost:5000" frontend/src/
# Should return NOTHING (or only comments)
grep -r "http://127.0.0.1:5000" frontend/src/
# Should return NOTHING (or only comments)
```
✅ If all checks pass, you're ready to deploy!

---

## **DEPLOYMENT STEPS**

```bash
# 1. Verify .env has DreamHost URL
cat frontend/.env
# Output: REACT_APP_API_BASE_URL=https://ryanmart.store/api

# 2. Build the frontend
cd frontend
npm run build
# Creates: frontend/build/

# 3. Upload build folder to DreamHost
# (Use FTP/SSH to upload entire 'build' folder to web root)

# 4. Test in browser
# Open: https://ryanmart.store
# Try to login
# Check Network tab for requests to: https://ryanmart.store/api/auth/login

# 5. Verify it works
# ✅ Login succeeds
# ✅ Dashboard loads
# ✅ Sales/Purchases/Stock visible
# ✅ Logout works
```

---

## **SUMMARY TABLE**

| Question | Answer |
|----------|--------|
| **Where is DreamHost URL stored?** | `frontend/.env` |
| **How is it used?** | React injects into `api.js` at build time |
| **What file controls login?** | `frontend/src/contexts/AuthContext.tsx` |
| **Does login code hardcode URL?** | ❌ NO (uses `api.post('/auth/login')`) |
| **How many files need URL?** | 1 file only: `frontend/.env` |
| **Is it localhost anymore?** | ❌ NO (now points to DreamHost) |
| **Can I test locally?** | ✅ YES (use `frontend/.env.local`) |
| **Is it production ready?** | ✅ YES (after `npm run build`) |

---

## **FINAL ANSWER**

**How does login connect to localhost? (BEFORE)**
- ❌ Hardcoded in 5+ files: `http://localhost:5000/api`
- ❌ Had to edit each file to change environment
- ❌ Not flexible or scalable

**How does login connect to DreamHost? (NOW)**
- ✅ Stored in ONE file: `frontend/.env`
- ✅ Read by `api.js` at build time
- ✅ `AuthContext.tsx` uses `api.post('/auth/login')` (no hardcoding)
- ✅ All requests auto-prepend `https://ryanmart.store/api`
- ✅ Flexible for dev/staging/production
- ✅ Ready to deploy

---

Generated: November 29, 2025  
Status: ✅ Frontend configured for DreamHost login  
Next: `npm run build` and upload to DreamHost
