# TODO: Implement Aggregated Debt per Customer in AccountTab

## Steps
- [x] Add new API endpoint in backend/resources/sales.py for aggregated debt per customer (sum of remaining_amount grouped by seller_email).
- [x] Update frontend/src/components/AccountTab.jsx to fetch aggregated debt data and display it in the table.
- [x] Modify the table to show customer-level rows with total debt, and possibly expand to show individual sales.
- [x] Ensure that updating paid_amount on individual sales refreshes the aggregated debt.
- [x] Test the implementation to verify debt aggregation works correctly.
- [x] Add PDF download feature for each customer's debt report.
