# ✅ Frontend-to-DreamHost Connection Map

## **Quick Reference**

### **1. Entry Point: .env file**
```
frontend/.env
└─ REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

### **2. Axios Setup: api.js**
```
frontend/src/api/api.js
└─ baseURL: process.env.REACT_APP_API_BASE_URL || '/api'
   (Reads from .env ↑)
```

### **3. Login: AuthContext.tsx**
```
frontend/src/contexts/AuthContext.tsx
└─ api.post('/auth/login', {email, password})
   ├─ baseURL prepends: https://ryanmart.store/api
   ├─ Final URL: https://ryanmart.store/api/auth/login
   └─ DreamHost responds with JWT token
```

### **4. Every Other Request**
```
api.get('/sales')           → https://ryanmart.store/api/sales
api.post('/purchases', data) → https://ryanmart.store/api/purchases
api.put('/users/:id', data)  → https://ryanmart.store/api/users/:id
fetch('/api/stock-tracking') → https://ryanmart.store/api/stock-tracking
```

---

## **Connection Flow (Text)**

```
Browser
  ↓
User logs in at https://ryanmart.store/login
  ↓
AuthContext calls: api.post('/auth/login', {email, password})
  ↓
api.js axios interceptor prepends baseURL from .env
  ↓
Request sent to: https://ryanmart.store/api/auth/login
  ↓
DreamHost backend receives request
  ↓
Backend returns: { success: true, data: { user, access_token, refresh_token } }
  ↓
Frontend stores tokens in localStorage
  ↓
All future requests include: Authorization: Bearer <token>
  ↓
✅ User is logged in and connected to DreamHost!
```

---

## **Files Modified for DreamHost Connection**

### **Critical Files (Must exist)**
- ✅ `frontend/.env` — Contains `REACT_APP_API_BASE_URL=https://ryanmart.store/api`
- ✅ `frontend/src/api/api.js` — Uses env var for baseURL
- ✅ `frontend/src/contexts/AuthContext.tsx` — Uses `api.post('/auth/login')`

### **Supporting Files (All use relative paths now)**
- ✅ `frontend/src/api/stockTracking.js` — Uses `/api/stock-tracking`
- ✅ `frontend/src/api/otherExpenses.js` — Uses `/api/other_expenses`
- ✅ `frontend/src/components/SalesTab.jsx` — Uses `/api/sales/report`
- ✅ `frontend/src/components/PurchasesTab.jsx` — Uses `/api/purchases/report`
- ✅ `frontend/src/contexts/AuthContext.tsx` — Uses `/api/auth/login`
- ✅ `frontend/src/components/OtherExpenseForm.jsx` — Uses `/api/other_expenses`
- ✅ `frontend/src/components/CeoMessagePanel.jsx` — Uses `/api/ceo-messages`
- ✅ `frontend/src/pages/SellerDashboard.jsx` — Uses `/api/assignments`, `/api/sales`
- ✅ `frontend/src/components/CarExpensesTab.jsx` — Uses `/api/car-expenses`
- ✅ `frontend/src/components/CarExpenseAggregationTab.jsx` — Uses `/api/car-expenses`
- ✅ `frontend/src/components/EnhancedSellerFruitsTable.jsx` — Uses `/api/sales`

---

## **How to Verify Connection**

### **Method 1: Check Network Requests**
1. Open browser: https://ryanmart.store
2. Press `F12` (Developer Tools)
3. Go to **Network** tab
4. Try to log in
5. Look for requests to `https://ryanmart.store/api/auth/login`
6. ✅ If you see this, DreamHost connection works!

### **Method 2: Check .env value**
```bash
cd frontend
grep REACT_APP_API_BASE_URL .env
# Should output: REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

### **Method 3: Check api.js code**
```bash
grep -A 2 "baseURL:" src/api/api.js
# Should show: baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
```

---

## **What Changed From Localhost**

### **BEFORE (localhost — ❌ OLD)**
```javascript
// Hardcoded in multiple files:
fetch('http://localhost:5000/api/auth/login', {...})
fetch('http://127.0.0.1:5000/api/sales', {...})
const BASE_URL = 'http://localhost:5000/api';
```

### **AFTER (DreamHost — ✅ NEW)**
```javascript
// All files now use relative paths:
api.post('/auth/login', {...})
api.get('/sales')
fetch('/api/stock-tracking')

// With baseURL from .env:
// REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

---

## **Deployment Checklist**

- [ ] Verify `.env` contains `REACT_APP_API_BASE_URL=https://ryanmart.store/api`
- [ ] Run `npm run build` in frontend directory
- [ ] Upload `build/` folder to DreamHost web root
- [ ] Test login at https://ryanmart.store
- [ ] Check browser Network tab for requests to DreamHost API
- [ ] Verify user can see sales, purchases, stock data
- [ ] Test logout
- [ ] Test token refresh (log out, close browser, come back)

---

## **Emergency: Switch Back to Localhost**

If you need to test locally again:
```bash
# Create/edit frontend/.env.local
REACT_APP_API_BASE_URL=http://localhost:5000/api

# Run dev server
npm start
# Frontend will connect to http://localhost:5000/api
```

(Create `.env.local` — it overrides `.env`)

---

## **Backend Expectations**

Your DreamHost backend (Flask) should have these endpoints:

```
POST   /api/auth/login              → Login user
POST   /api/auth/refresh            → Refresh JWT token
GET    /api/sales                   → Get all sales
POST   /api/sales                   → Create sale
GET    /api/purchases               → Get purchases
POST   /api/other_expenses          → Create expense
GET    /api/stock-tracking          → Get stock data
... (and many more)
```

All endpoints are called with:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## **Questions & Answers**

**Q: Why use .env instead of hardcoding?**
A: Because `.env` changes per environment. DreamHost = production URL. Localhost = dev URL. One codebase works everywhere.

**Q: How does axios know the baseURL?**
A: React injects `process.env.REACT_APP_API_BASE_URL` at build time (from `.env`).

**Q: What if .env is missing?**
A: Fallback to `/api` (relative path). Works only if API is same domain.

**Q: How is token stored?**
A: `localStorage.access_token` (plain text in browser — that's ok for JWT).

**Q: How does token refresh work?**
A: If backend returns 401 (unauthorized), axios auto-refreshes token and retries request.

**Q: Do I need to rebuild for DreamHost?**
A: Yes! `npm run build` injects `.env` values into the build.

**Q: Can I test locally before uploading?**
A: Yes, use `.env.local` to override `.env` with localhost URL.

---

Generated: November 29, 2025
Status: ✅ Frontend ready for DreamHost deployment
