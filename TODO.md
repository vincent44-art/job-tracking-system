# TODO: Fix 400 Bad Request Error for POST /api/seller-fruits

## Current Status
- Analyzed backend API, data model, and frontend form
- Identified that 400 error comes from missing/invalid fields in request payload
- Backend validation checks for: stock_name, fruit_name, qty, unit_price, date, amount

## Tasks
- [x] Enhance backend/resources/seller_fruits.py POST method with detailed error messages
- [x] Add detailed logging to diagnose actual request payload issues
- [ ] Review frontend form validation in SellerFruitsForm.jsx
- [x] Test the changes to ensure proper error reporting

## Files to Modify
- backend/resources/seller_fruits.py
- frontend/src/components/seller/SellerFruitsForm.jsx (optional)
