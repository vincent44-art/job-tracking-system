# 🔌 BACKEND-FRONTEND CONNECTION GUIDE

**Status:** Ready to connect locally  
**Date:** December 1, 2025

---

## **QUICK START (3 Steps)**

### **Step 1: Start the Backend** (Terminal 1)
```bash
cd /home/vincent/money/job-tracking-system
source backend/venv/bin/activate
export FLASK_ENV=development
export FLASK_DEBUG=1
python backend/app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### **Step 2: Start the Frontend** (Terminal 2)
```bash
cd /home/vincent/money/job-tracking-system/frontend
npm start
```

You should see:
```
Compiled successfully!
webpack compiled...
```

Browser will open at `http://localhost:3000`

### **Step 3: Test Login**
1. Open browser: `http://localhost:3000`
2. Try login with any credentials (database has default users)
3. Check DevTools → Network → Should see POST to `http://localhost:5000/api/auth/login`
4. If successful → Tokens stored in localStorage ✅

---

## **DATABASE CONFIGURATION**

### **Current Setup**
```
Database:    SQLite (fruittrack.db in instance/ folder)
Location:    /home/vincent/money/job-tracking-system/instance/fruittrack.db
Config:      backend/config.py
Env File:    backend/.env
```

### **To Use PostgreSQL Instead (Optional)**

If you want to use PostgreSQL instead of SQLite:

**1. Install PostgreSQL (Ubuntu)**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**2. Create Database & User**
```bash
sudo -u postgres psql
CREATE USER ryanmart_user WITH PASSWORD 'your_password_here';
CREATE DATABASE ryanmart_db OWNER ryanmart_user;
GRANT ALL PRIVILEGES ON DATABASE ryanmart_db TO ryanmart_user;
\q
```

**3. Update backend/.env**
```properties
DATABASE_URL=postgresql://ryanmart_user:your_password_here@localhost:5432/ryanmart_db
```

**4. Reinstall Dependencies**
```bash
cd /home/vincent/money/job-tracking-system/backend
pip install psycopg2-binary
pip install -r requirements.txt
```

**5. Test Connection**
```bash
python -c "from backend.config import Config; from backend.extensions import db; from backend.app import create_app; app = create_app(); print('Database URL:', app.config['SQLALCHEMY_DATABASE_URI']); db.create_all()"
```

---

## **DETAILED CONNECTION FLOW**

### **Frontend → Backend Communication**

```
User enters email/password in Login.jsx
    ↓
Calls: api.post('/auth/login', {email, password})
    ↓
axios baseURL = http://localhost:5000/api
    ↓
POST http://localhost:5000/api/auth/login
    ↓
Request headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>' (if refreshing)
}
    ↓
Backend LoginResource receives request
    ↓
Query User table: User.query.filter_by(email=email).first()
    ↓
Check password: user.check_password(password)
    ↓
If valid:
  - Create JWT tokens
  - Return: {access_token, refresh_token, user}
  - Status: 200
    ↓
Frontend receives response
    ↓
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', token)
localStorage.setItem('fruittrack_user', user_data)
    ↓
Redirect to dashboard ✅
```

### **Subsequent Requests (Authenticated)**

```
User clicks "View Sales"
    ↓
Calls: api.get('/sales')
    ↓
axios request interceptor adds:
  Authorization: Bearer <access_token from localStorage>
    ↓
GET http://localhost:5000/api/sales
  With header: Authorization: Bearer eyJhbGc...
    ↓
Backend validates token
    ↓
If valid: Return sales data
If expired: Return 401 → Frontend refreshes token → Retries
If invalid: Return 401 → Frontend redirects to login
    ↓
Frontend shows data ✅
```

---

## **CONFIGURATION FILES**

### **backend/config.py** (Already Set)
```python
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') \
        or 'sqlite:///fruittrack.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # CORS - Allow frontend
    CORS_ORIGINS = ["http://localhost:3000"]
```

### **frontend/.env** (Already Set)
```properties
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### **frontend/src/api/api.js** (Already Set)
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

---

## **TESTING THE CONNECTION**

### **Test 1: Check Backend is Running**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Service is running",
  "version": "1.0.0"
}
```

### **Test 2: Test Login Endpoint**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response (on success):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "test@example.com",
      "name": "Test User",
      "role": "seller"
    }
  },
  "message": "Login successful"
}
```

Expected response (on failure):
```json
{
  "success": false,
  "message": "Invalid credentials",
  "status_code": 401
}
```

### **Test 3: Test with Token**
```bash
# Replace TOKEN with the access_token from Test 2
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

Expected:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "name": "Test User",
    "role": "seller"
  },
  "message": "Current user data fetched."
}
```

---

## **TROUBLESHOOTING**

### **Issue: "Connection refused" on login**
**Cause:** Backend not running

**Fix:**
```bash
# Terminal 1
cd /home/vincent/money/job-tracking-system
source backend/venv/bin/activate
python backend/app.py
```

### **Issue: "CORS error" in browser console**
**Cause:** CORS not configured for frontend origin

**Fix:** Update `backend/config.py`
```python
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ryanmart.store"  # For production
]
```

### **Issue: 404 on /api/auth/login**
**Cause:** Backend route not registered correctly

**Fix:** Check `backend/app.py` line 107
```python
api.add_resource(LoginResource, '/api/auth/login')  # Must have /api prefix
```

### **Issue: "Invalid credentials" even with correct password**
**Cause:** User doesn't exist or password hash mismatch

**Fix:** Create a test user
```bash
cd /home/vincent/money/job-tracking-system
source backend/venv/bin/activate
python backend/create_sample_data.py  # Creates sample users
```

### **Issue: Token not working (401 on authenticated requests)**
**Cause:** JWT_SECRET_KEY mismatch between frontend and backend

**Fix:** Ensure `backend/.env` has correct `JWT_SECRET_KEY` and `frontend/src/api/api.js` is using it

---

## **ENVIRONMENT VARIABLES**

### **backend/.env**
```properties
# Flask
SECRET_KEY='a-very-strong-development-secret-key'
FLASK_APP=app.py
FLASK_ENV=development
FLASK_DEBUG=1

# Database (SQLite - default)
DATABASE_URL='sqlite:///fruittrack.db'

# Database (PostgreSQL - optional)
# DATABASE_URL='postgresql://user:password@localhost:5432/dbname'

# JWT
JWT_SECRET_KEY='a-super-secret-jwt-key'
```

### **frontend/.env**
```properties
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### **For DreamHost Deployment**
Update `frontend/.env`:
```properties
REACT_APP_API_BASE_URL=https://ryanmart.store/api
```

---

## **API ENDPOINTS (BACKEND)**

### **Authentication**
- `POST /api/auth/login` — Login with email/password
- `POST /api/auth/refresh` — Refresh access token
- `GET /api/auth/me` — Get current user (requires token)
- `POST /api/auth/change-password` — Change password

### **Users**
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `GET /api/users/<id>` — Get user
- `PUT /api/users/<id>` — Update user
- `DELETE /api/users/<id>` — Delete user

### **Sales**
- `GET /api/sales` — List sales
- `POST /api/sales` — Create sale
- `GET /api/sales/<id>` — Get sale
- `GET /api/sales/report/<date>` — Daily sales report

### **Purchases**
- `GET /api/purchases` — List purchases
- `POST /api/purchases` — Create purchase
- `GET /api/purchases/report/<date>` — Daily purchases report

### **Stock**
- `GET /api/stock-tracking` — List stock movements
- `POST /api/stock-tracking` — Track stock movement
- `GET /api/stock-tracking/aggregated` — Aggregated stock

---

## **NEXT STEPS**

1. **Start Backend:** Run `python backend/app.py` in Terminal 1
2. **Start Frontend:** Run `npm start` in Terminal 2
3. **Test Login:** Open `http://localhost:3000` and try logging in
4. **Check DevTools:** F12 → Network → Verify requests to `http://localhost:5000/api/*`
5. **Check Storage:** F12 → Application → localStorage → Should have `access_token`, `refresh_token`, `fruittrack_user`

---

## **SUMMARY**

✅ **Backend:** Flask app on `http://localhost:5000`  
✅ **Frontend:** React app on `http://localhost:3000`  
✅ **Database:** SQLite at `instance/fruittrack.db`  
✅ **Auth:** JWT tokens via `/api/auth/login`  
✅ **CORS:** Configured for `http://localhost:3000`  

**Everything is ready to run locally!**

---

*Generated: December 1, 2025*  
*Setup Status: Ready for local development*
