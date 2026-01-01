# Fix Login 500 Error: Database Tables Not Created

## Problem
- Login fails with 500 error: "relation 'user' does not exist"
- Database tables not created on Render deployment
- Migrations not running properly during build

## Root Cause
- Flask-Migrate command in render.yaml was incorrect: "cd backend && PYTHONPATH=/opt/render/project/src flask db upgrade"
- This changed directory to backend, but Flask couldn't find the app module

## Solution
- Updated render.yaml buildCommand to run migrations from project root with correct app reference
- Added command to create CEO user after migrations

## Changes Made
- [x] Updated render.yaml: Changed migration command from "flask --app backend.app db upgrade" to "python backend/create_tables.py" to use db.create_all() instead of migrations
- [x] This avoids migration conflicts where some tables exist and others don't

## Next Steps
- [ ] Redeploy backend on Render to apply changes
- [ ] Test login with ceo@ryanmart.com / password123
- [ ] Verify tables are created and user exists
