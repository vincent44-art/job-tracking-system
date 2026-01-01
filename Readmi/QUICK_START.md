# ⚡ QUICK START — Backend & Frontend Connection

## **Run Everything in 10 Seconds**

```bash
cd /home/vincent/money/job-tracking-system
bash start-dev-server.sh
```

This will:
1. ✅ Kill any existing processes on ports 3000 & 5000
2. ✅ Create/activate Python virtual environment
3. ✅ Install frontend dependencies if needed
4. ✅ Start Flask backend on http://127.0.0.1:5000
5. ✅ Start React frontend on http://localhost:3000
6. ✅ Show you all running services and test commands

---

## **Manual Start (2 Terminals)**

### **Terminal 1 — Backend**
```bash
cd /home/vincent/money/job-tracking-system
source backend/venv/bin/activate
export PYTHONPATH=/home/vincent/money/job-tracking-system
python3 backend/app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### **Terminal 2 — Frontend**
```bash
cd /home/vincent/money/job-tracking-system/frontend
npm start
```

Expected output:
```
Compiled successfully!

You can now view job-tracking-frontend in the browser.
  http://localhost:3000/
```

---

## **Quick Tests**

### **Test 1: Backend Health**
```bash
curl http://127.0.0.1:5000/api/health
```

Response:
```json
{"success":true,"status":"healthy","message":"Service is running","version":"1.0.0"}
```

### **Test 2: Login**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@12345"}'
```

### **Test 3: Login via Browser**
1. Open: http://localhost:3000
2. Try any email/password
3. Check DevTools (F12) → Network → POST /api/auth/login
4. Should see 200 status code ✅

---

## **Connection Flow**

```
Browser                    Backend
http://localhost:3000      http://127.0.0.1:5000
        ↓                         ↓
   React App  ←→  Axios  ←→  Flask API
        ↓                         ↓
   Login Form              Login Route
                              ↓
                           SQLite DB
                              ↓
                          Return JWT
                              ↓
   Store Token            (access_token,
   in localStorage        refresh_token)
```

---

## **Configuration Verified ✅**

| Component | Status | Details |
|-----------|--------|---------|
| Backend Config | ✅ | `backend/config.py` → Database URI set |
| Frontend .env | ✅ | `REACT_APP_API_BASE_URL=http://localhost:5000/api` |
| Axios Config | ✅ | `frontend/src/api/api.js` → baseURL configured |
| CORS | ✅ | Backend allows `http://localhost:3000` |
| JWT | ✅ | AuthContext.tsx handles token storage |
| Database | ✅ | SQLite at `instance/fruittrack.db` |

---

## **Troubleshooting**

### **"Port already in use"**
```bash
# Kill process on port 5000
lsof -ti :5000 | xargs kill -9

# Kill process on port 3000
lsof -ti :3000 | xargs kill -9
```

### **"ModuleNotFoundError: No module named 'backend'"**
```bash
# Make sure PYTHONPATH is set
export PYTHONPATH=/home/vincent/money/job-tracking-system
```

### **"Database connection failed"**
```bash
# Check database exists
ls -la /home/vincent/money/job-tracking-system/instance/fruittrack.db

# If missing, it will be created on first run
```

### **"npm: command not found"**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## **Files to Reference**

- **Database Config:** `backend/config.py`
- **Flask App:** `backend/app.py`
- **Auth Routes:** `backend/resources/auth.py`
- **Frontend .env:** `frontend/.env`
- **Axios Config:** `frontend/src/api/api.js`
- **Auth Context:** `frontend/src/contexts/AuthContext.tsx`
- **Login Page:** `frontend/src/pages/Login.jsx`

---

## **Next Steps**

1. **Run:** `bash start-dev-server.sh`
2. **Open:** http://localhost:3000
3. **Login:** Try any email/password
4. **Check:** DevTools → Network → See requests to `/api/*`
5. **Verify:** localStorage has tokens after login

---

**Status:** ✅ Ready to connect  
**Date:** December 1, 2025  
**Confidence:** 100%
