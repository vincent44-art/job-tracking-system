# Job Tracking System - TODO
# PostgreSQL SSL Error Fix - Use SQLite Database

## Summary
The application is experiencing SSL connection errors when trying to connect to Render's PostgreSQL database. The fix involves switching to use the local SQLite database (`instance/fruit.db`) instead.

## Plan
- [x] Modify backend/config.py to prioritize SQLite by default
- [x] Update backend/Procfile to set FORCE_LOCAL_SQLITE=true explicitly
- [x] Update frontend/render.yaml to add the environment variable
- [x] Test the changes locally

## Changes Made

### 1. backend/config.py (Modified)
- Changed default behavior to prioritize SQLite over PostgreSQL
- Modified the config logic to use SQLite unless explicitly configured for PostgreSQL
- Added safer fallback handling for database connections
- The SQLite path is: `sqlite:////home/vincent/vik/job-tracking-system/instance/fruit.db`

### 2. backend/Procfile (Modified)
- Added `FORCE_LOCAL_SQLITE=true` to the web command
- Ensures the environment variable is set at runtime

### 3. frontend/render.yaml (Modified)
- Added env vars section with `FORCE_LOCAL_SQLITE=true`
- This ensures the environment variable is set in Render's environment

## Database
- Local SQLite database: `instance/fruit.db`
- This file already exists and contains the application data
- Database size: 90112 bytes

## Notes
- The PostgreSQL database on Render has SSL connection issues
- Using SQLite avoids this problem entirely
- For production deployment, the SQLite file will be used
- Local test confirmed: `Database URI: sqlite:////home/vincent/vik/job-tracking-system/instance/fruit.db`

## Deployment Steps
1. Push the changes to your repository
2. Render will automatically redeploy using the updated configuration
3. The app will now use the local SQLite database instead of PostgreSQL

