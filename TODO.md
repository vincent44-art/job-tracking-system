# TODO: Make Dates Automatic in the System

## Backend Model Updates
- [ ] Update backend/models/purchases.py: Add default=datetime.utcnow to purchase_date
- [ ] Update backend/models/stock_tracking.py: Add default=datetime.utcnow to date_in
- [ ] Update backend/models/seller_fruit.py: Add default=datetime.utcnow to date
- [ ] Update backend/models/receipt.py: Add default=datetime.utcnow to date

## Backend Resource API Updates
- [ ] Update backend/resources/sales.py: Make 'date' optional in parser, use current date if not provided
- [ ] Update backend/resources/purchases.py: Make 'date' optional in parser, use current date if not provided
- [ ] Update backend/resources/other_expenses.py: Make 'date' optional in parser, use current date if not provided
- [ ] Update backend/resources/stock_tracking.py: Ensure dateIn defaults to current date (already partially done)
- [ ] Update backend/resources/seller_fruits.py: Make 'date' optional, use current date if not provided
- [ ] Update backend/resources/salaries.py: Make 'date' optional, use current date if not provided
- [ ] Update backend/resources/receipts.py: Make 'date' optional, use current date if not provided

## Frontend Form Updates
- [ ] Update frontend forms to auto-set dates or make them optional (SalesTab.jsx, PurchasesTab.jsx, OtherExpensesTab.jsx, StockTrackerTab.jsx, SellerFruitsForm.jsx, SalaryFormModal.jsx, SaleInvoiceForm.jsx)

## Followup Steps
- [ ] Run database migrations if needed for new defaults
- [ ] Test API endpoints to ensure dates are set automatically
- [ ] Update frontend to reflect changes
