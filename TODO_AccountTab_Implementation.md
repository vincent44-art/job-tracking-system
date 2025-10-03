# TODO: Implement Account Tab for Customer Information

## Information Gathered
- Current AccountTab.jsx uses an empty react-spreadsheet.
- Backend Sale model has: seller_email (customer name), stock_name, date, amount (expected amount).
- Need to add paid_amount and remaining_amount fields to Sale model.
- Account Tab should display: Customer Name, Stock Name, Date, Expected Amount, Paid Amount (editable), Remaining Amount (calculated).
- Support multiple customers (rows).
- Allow editing paid amounts and saving changes.

## Plan
- [ ] Update backend/models/sales.py to add paid_amount and remaining_amount fields.
- [ ] Update backend/resources/sales.py to include new fields in API responses and handle updates.
- [ ] Create database migration for new fields.
- [ ] Update frontend/src/components/AccountTab.jsx to fetch sales data, display in table with editable paid amounts, calculate remaining amounts, and save changes.
- [ ] Test the implementation.

## Dependent Files to be Edited
- backend/models/sales.py
- backend/resources/sales.py
- frontend/src/components/AccountTab.jsx
- Possibly create migration file.

## Followup Steps
- [ ] Run database migration.
- [ ] Verify data fetching and display.
- [ ] Test editing and saving paid amounts.
- [ ] Confirm remaining amounts are calculated correctly.
