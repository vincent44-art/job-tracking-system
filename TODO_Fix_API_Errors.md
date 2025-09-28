# API Error Fixes - Progress Tracking

## Issues Fixed:
- [x] **Receipts API KeyError**: Changed `data['receiptNum']` to `data['invoiceNum']` in `backend/resources/receipts.py`
- [x] **Seller Fruits JWT Error**: Added `@jwt_required()` decorator to POST method in `backend/resources/seller_fruits.py`

## Testing Status:
- [ ] Test `/api/receipts` POST endpoint with invoice data
- [ ] Test `/api/seller-fruits` POST endpoint with JWT authentication
- [ ] Verify no more 500 errors occur

## Files Modified:
- `backend/resources/receipts.py` - Fixed field name mismatch
- `backend/resources/seller_fruits.py` - Added JWT authentication to POST method
