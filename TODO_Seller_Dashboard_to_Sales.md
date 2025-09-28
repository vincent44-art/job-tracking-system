# Seller Dashboard to Sales Table Migration

## Tasks
- [x] Update backend/models/sales.py: add stock_name column, rename fruit_type to fruit_name, quantity to qty, revenue to amount, sale_date to date, remove seller_fruit_id
- [ ] Create Alembic migration for sales table changes
- [x] Update backend/resources/sales.py to handle new fields in API
- [x] Update frontend/src/api/sellerFruits.js to use sales API endpoints
- [ ] Update frontend/src/pages/SellerDashboard.jsx to fetch sales data instead of seller_fruits
- [ ] Update frontend/src/components/seller/SellerFruitsTable.jsx to display sales data (adjust field mappings)
- [ ] Update frontend/src/components/seller/SellerFruitsForm.jsx to save to sales API
- [ ] Run database migration
- [ ] Test the seller dashboard functionality
