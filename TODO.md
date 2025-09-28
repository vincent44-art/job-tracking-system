# TODO: Make Seller Tab Fetch from Seller_Fruit Table

## Steps to Complete

- [x] Fix frontend/src/api/sellerFruits.js to call /seller-fruits instead of /sales
- [x] Modify frontend/src/components/SellersTab.jsx to fetch its own data using the corrected API, similar to SalesTab
- [x] Update Dashboard.jsx to not pass data prop to SellersTab
- [x] Test the changes to ensure data is displayed correctly

## Information Gathered

- SellersTab currently receives data from ceo_dashboard API, which fetches from SellerFruit table.
- Frontend API sellerFruits.js incorrectly calls /sales instead of /seller-fruits.
- SellersTab displays data in a table matching SellerFruit model fields.
- To make seller tab fetch directly from seller_fruit table, fix API and modify SellersTab to fetch independently.

## Dependent Files

- frontend/src/api/sellerFruits.js
- frontend/src/components/SellersTab.jsx
- frontend/src/pages/Dashboard.jsx
