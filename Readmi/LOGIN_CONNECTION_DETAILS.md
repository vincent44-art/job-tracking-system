# 🔐 Login Flow — How Frontend Connects to DreamHost Backend

## **Overview**
Your frontend login system is NOW configured to connect to **DreamHost** (https://ryanmart.store/api) instead of localhost. Here's the exact connection flow:

---

## **1. ENVIRONMENT CONFIGURATION**

### **File:** `frontend/.env`
```properties
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```
✅ **What this does:**
- Tells React to use DreamHost as the base URL for ALL API requests
- When React builds, this value is baked into the application

---

## **2. AXIOS INSTANCE SETUP**

### **File:** `frontend/src/api/api.js` (Lines 1-15)

```javascript
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  //       ↑ This reads from .env file ↑
  //       If REACT_APP_API_BASE_URL exists, use it
  //       Otherwise, fall back to relative '/api' path
  
  withCredentials: true,  // Allow cookies
  timeout: 10000,         // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

✅ **What this does:**
- Creates a reusable `api` object that all components import
- **Automatically** prepends `https://ryanmart.store/api` to every request
- If `.env` changes, no code changes needed

**Flow:**
```
api.post('/auth/login', {...})
    ↓
baseURL: https://ryanmart.store/api
    ↓
FINAL URL: https://ryanmart.store/api/auth/login
```

---

## **3. LOGIN REQUEST FLOW**

### **File:** `frontend/src/contexts/AuthContext.tsx` (Line 71-75)

```tsx
const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    //                           ↓
    //                    This endpoint path
    //                    Becomes: https://ryanmart.store/api/auth/login
    //                    (because of baseURL in api.js)

      if (response.data.success) {
        const user = response.data.data.user;
        const token = response.data.data.access_token;
        const refreshToken = response.data.data.refresh_token;

        // Store tokens in browser
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
      return false;
    }
  };
```

✅ **What this does:**
1. User enters email & password on login form
2. `api.post('/auth/login', data)` is called
3. axios automatically prepends `https://ryanmart.store/api`
4. Request sent to: **https://ryanmart.store/api/auth/login**
5. Backend at DreamHost receives request
6. Backend validates credentials
7. Backend returns JWT token
8. Frontend stores token in `localStorage.access_token`

---

## **4. REQUEST INTERCEPTOR (Auto-Auth)**

### **File:** `frontend/src/api/api.js` (Lines 16-30)

```javascript
// Add a request interceptor to attach the access token and cache-buster
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      //                              ↓
      //                    Auto-adds to EVERY request
      //                    Header: Authorization: Bearer <jwt_token>
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

✅ **What this does:**
- Automatically adds `Authorization: Bearer <token>` header to every request
- DreamHost backend uses this to verify user is logged in
- No manual token handling needed in components

---

## **5. TOKEN REFRESH FLOW**

### **File:** `frontend/src/api/api.js` (Lines 40-65)

```javascript
// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Store new access token if provided in response
    if (response.data?.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh (401 status)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        refreshTokenRequest = refreshTokenRequest ||
          api.post('/auth/refresh', {
            //      ↓ Becomes: https://ryanmart.store/api/auth/refresh
            refresh_token: localStorage.getItem('refresh_token')
          }, {
            skipAuthRefresh: true,
          });

        const { data } = await refreshTokenRequest;
        localStorage.setItem('access_token', data.access_token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        window.location.href = '/login?session_expired=true';
        return Promise.reject(refreshError);
      } finally {
        refreshTokenRequest = null;
      }
    }
    // ... other error handling
  }
);
```

✅ **What this does:**
- If token expires (401 error), automatically refreshes it
- Sends refresh_token to **https://ryanmart.store/api/auth/refresh**
- Gets new JWT from DreamHost
- Retries original request with new token
- If refresh fails, redirects to login

---

## **COMPLETE LOGIN REQUEST SEQUENCE DIAGRAM**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER (Frontend)                │
└─────────────────────────────────────────────────────────────┘
                             │
                    1. User clicks "Login"
                    2. Enters: user@example.com / password123
                             │
                    ┌────────▼────────┐
                    │  AuthContext    │
                    │  .login()       │
                    └────────┬────────┘
                             │
                    3. Calls api.post('/auth/login', {...})
                             │
                    ┌────────▼────────────────┐
                    │  api.js (axios)         │
                    │  Interceptor adds:      │
                    │  - Content-Type header  │
                    │  - auth token (if any)  │
                    │  - baseURL prefix       │
                    └────────┬────────────────┘
                             │
                    4. Final URL becomes:
                    https://ryanmart.store/api/auth/login
                              │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │              🌐 INTERNET / HTTPS                │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────▼────────────────┐
                    │   DreamHost Backend     │
                    │   (Python/Flask)        │
                    │                         │
                    │  /api/auth/login        │
                    │  - Verify email         │
                    │  - Check password       │
                    │  - Generate JWT token   │
                    └────────┬────────────────┘
                             │
                    5. Response (JSON):
                    {
                      "success": true,
                      "data": {
                        "user": { id, email, role, ... },
                        "access_token": "eyJhbG...",
                        "refresh_token": "eyJhbG..."
                      }
                    }
                             │
                    ┌────────▼──────────────────┐
                    │  Frontend (AuthContext)   │
                    │  - Store tokens           │
                    │  - Update user state      │
                    │  - Redirect to dashboard  │
                    └───────────────────────────┘
                             │
                    6. User now logged in ✅
```

---

## **HOW TO VERIFY IT'S CONNECTED TO DREAMHOST**

### **Step 1: Check the `.env` file**
```bash
cd frontend
cat .env
```
**Should show:**
```
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

### **Step 2: Check `api.js` baseURL**
```bash
grep -A 5 "axios.create" src/api/api.js
```
**Should show:**
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
```

### **Step 3: Build and test**
```bash
npm run build
```

### **Step 4: Check Network Requests (in browser)**
1. Open your site: https://ryanmart.store (or localhost:3000 in dev)
2. Press `F12` to open Developer Tools
3. Go to **Network** tab
4. Click "Login" button
5. Look for request to: **https://ryanmart.store/api/auth/login**
6. ✅ If you see this URL, you're connected to DreamHost!

---

## **WHAT HAPPENS IF `.env` IS NOT SET?**

```javascript
baseURL: process.env.REACT_APP_API_BASE_URL || '/api'
                                              ↑
                                        Fallback path
```

If `REACT_APP_API_BASE_URL` is not defined:
- Uses relative path `/api`
- Works if frontend is on SAME SERVER as backend
- Example: If frontend at `https://ryanmart.store` and backend at `https://ryanmart.store/api`

**But we're using full URL**, so no fallback needed.

---

## **FILES THAT WERE UPDATED FOR DREAMHOST**

| File | Change |
|------|--------|
| `frontend/.env` | Set `REACT_APP_API_BASE_URL=https://ryanmart.store/api` |
| `frontend/src/api/api.js` | Already uses env var ✅ |
| `frontend/src/contexts/AuthContext.tsx` | Uses `api.post('/auth/login')` ✅ |
| `frontend/src/api/stockTracking.js` | All use `/api/` relative paths ✅ |
| `frontend/src/api/otherExpenses.js` | All use `/api/` relative paths ✅ |
| `frontend/src/components/SalesTab.jsx` | All use `/api/` relative paths ✅ |
| `frontend/src/components/PurchasesTab.jsx` | All use `/api/` relative paths ✅ |
| All other components | All use `/api/` relative paths ✅ |

---

## **🚀 FINAL STEP: BUILD & DEPLOY**

```bash
# Build for production
cd frontend
npm run build

# Upload 'build/' folder to DreamHost
# Your site: https://ryanmart.store
# API: https://ryanmart.store/api
```

**Result:** ✅ All login requests and API calls go to DreamHost automatically!

---

## **SUMMARY**

| Aspect | Details |
|--------|---------|
| **Login endpoint** | `/auth/login` → `https://ryanmart.store/api/auth/login` |
| **How?** | axios baseURL from `.env` auto-prepends |
| **Token storage** | `localStorage.access_token` |
| **Token used in requests** | `Authorization: Bearer <token>` header |
| **Token refresh** | Auto-happens if 401 error |
| **No localhost** | ✅ All hardcoded URLs removed |
| **Ready to deploy?** | ✅ Yes, run `npm run build` |
