# TODO: Add Daily PDF Generation for Stock Tracking

## Backend Changes
- [ ] Add new resource classes in stock_tracking.py for daily stock in and stock out PDFs
- [ ] Create endpoints to generate PDFs for all stock in on a date and all stock out on a date
- [ ] Implement PDF generation logic for daily stock entries and exits

## Frontend Changes
- [ ] Update stockTracking.js API to include calls for the new endpoints
- [ ] Update StoreKeeperDashboard.jsx to include buttons for generating daily PDFs
- [ ] Add date picker for selecting the date for PDF generation

## Testing
- [ ] Test PDF downloads for stock in and stock out
- [ ] Ensure date selection works properly
- [ ] Verify PDF content includes all relevant stock data for the day
 