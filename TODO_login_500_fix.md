# TODO: Fix 500 Internal Server Error on /api/auth/login

## Information Gathered
- LoginResource in `backend/resources/auth.py` handles login but doesn't validate if email/password are present after extracting from JSON.
- `user_lookup_callback` in `backend/app.py` directly accesses `jwt_data["sub"]` without checking if it exists, causing KeyError if missing.
- No full error logging enabled in production for debugging.

## Plan
- [ ] Fix `user_lookup_callback` in `backend/app.py` to safely access `jwt_data.get("sub")` and return None if missing.
- [ ] Add validation in LoginResource to ensure email and password are provided.
- [ ] Add `logging.basicConfig(level=logging.DEBUG)` in `create_app` for temporary debugging.
- [ ] Redeploy backend and test login.
- [ ] Check Render logs for exact error if still failing.

## Dependent Files
- `backend/app.py`
- `backend/resources/auth.py`

## Followup Steps
- Redeploy backend.
- Test login endpoint.
- If still 500, check Render logs for traceback.
- Remove debug logging after fixing.
