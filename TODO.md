# TODO: Allow Purchasers to See All Purchase Data

## Plan Summary:
The purchaser dashboard currently only shows purchases made by the logged-in purchaser user. We need to modify it so purchasers can see ALL purchases from the database.

## Steps to Complete:

### Backend Changes:
1. [ ] Modify `PurchaseListResource.get()` in `backend/resources/purchases.py` to allow purchasers to see all purchases
2. [ ] Update role permissions to allow purchasers to access all purchase data

### Frontend Changes:
3. [ ] Update `PurchaserDashboard.jsx` to fetch all purchases instead of user-specific ones
4. [ ] Modify API call from `fetchPurchases(user.email)` to general purchases endpoint
5. [ ] Update `frontend/src/api/purchase.js` to support fetching all purchases

### Testing:
6. [ ] Test that purchasers can see all purchases
7. [ ] Verify new purchases are still associated with logged-in user
8. [ ] Check CEO functionality remains unchanged

## Current Status:
- [ ] Backend changes completed
- [ ] Frontend changes completed
- [ ] Testing completed
