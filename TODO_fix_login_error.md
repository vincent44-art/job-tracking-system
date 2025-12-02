# Fix Login Error: relation "user" does not exist

## Problem
- Server error during login: psycopg2.errors.UndefinedTable: relation "user" does not exist
- Database tables not being created properly on Render deployment
- Migrations failing due to existing tables conflicting with new ones

## Root Cause
- On Render (production), the database is PostgreSQL, but migrations are not running correctly
- Some tables exist from previous attempts, but the "user" table is missing
- Flask-Migrate upgrade command fails when trying to create tables that already exist

## Solution
- Replace migrations with db.create_all() in render.yaml buildCommand
- This will create all tables without worrying about migration history
- Use create_tables.py script which calls db.create_all()

## Changes Made
- [x] Updated render.yaml: Changed buildCommand from "flask --app backend.app db upgrade" to "python backend/create_tables.py"
- [x] Updated TODO_login_500_fix.md to reflect the new approach

## Next Steps
- [ ] Redeploy backend on Render to apply changes
- [ ] Test login functionality with ceo@ryanmart.com / password123
- [ ] Verify that all database tables are created successfully
- [ ] Confirm that the CEO user is created by create_ceo_user.py

## Files Modified
- render.yaml: Updated buildCommand to use create_tables.py instead of migrations
- TODO_login_500_fix.md: Updated documentation

## Testing
- After redeployment, check Render logs for successful table creation
- Test login endpoint to ensure no more "relation 'user' does not exist" error
