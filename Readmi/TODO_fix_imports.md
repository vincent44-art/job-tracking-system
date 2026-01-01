# TODO: Fix Import Errors in app.py

## Tasks
- [ ] Update top-level imports to relative imports
- [ ] Update imports inside create_app function to relative imports
- [ ] Test gunicorn startup after changes

## Details
- Change all `from backend.*` to `from .*` in job-tracking-system/backend/app.py
- This fixes ModuleNotFoundError when running gunicorn from backend directory
