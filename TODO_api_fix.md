# TODO: Fix Frontend API Base URL

## Current Status
- Frontend is hitting 405 and 404 errors because it's calling localhost instead of Render backend
- Some components already have correct BASE_URL, but main API service uses relative paths

## Tasks
- [ ] Update src/services/api.js to use REACT_APP_API_BASE_URL || Render URL
- [ ] Update src/api/stockTracking.js to use full URLs instead of relative paths
- [ ] Create .env file with REACT_APP_API_BASE_URL=https://job-tracking-system-pdnz.onrender.com/api
- [ ] Clear React cache (rm -rf node_modules && npm install && npm run build)
- [ ] Deploy to Render (git add, commit, push)

## Verification
- Check browser Network tab for login request: should be https://job-tracking-system-pdnz.onrender.com/api/auth/login
- Not http://localhost:5000/auth/login
