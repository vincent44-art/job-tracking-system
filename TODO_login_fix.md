# Login Fix Summary

## Issue
- Frontend was calling '/auth/login' but backend expects '/api/auth/login'
- Error: 405 Method Not Allowed when trying to login

## Root Cause
- Frontend services/api.js had baseURL set to 'http://localhost:5000' initially
- AuthContext calls '/auth/login', so full URL was 'http://localhost:5000/auth/login'
- Backend has auth routes at '/api/auth/login'

## Solution
- Changed baseURL in frontend/src/services/api.js from 'http://localhost:5000' to '/api'
- Now AuthContext calls '/auth/login' resolve to '/api/auth/login'
- With React proxy, this becomes 'http://localhost:5000/api/auth/login' which matches backend

## Files Changed
- job-tracking-system/frontend/src/services/api.js: Updated API_BASE_URL to '/api'

## Testing
- Restart frontend development server after changes
- Try logging in to verify the fix works
