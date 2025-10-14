# TODO: Modify Stock Tracking Overview Table

## Task: Combine stocks that come in on the same date and produce the same PDF

### Information Gathered:
- **StockTrackerTab.jsx**: Displays individual stock records in the "Stock Tracking Overview" table, showing first 5 records.
- **Backend stock_tracking.py**: Has `StockTrackingCombinedPDFResource` that generates combined PDF for a date, including stocks in and out on that date.
- **Current Table Structure**: Shows individual stocks with columns: Stock Name, Date In, Fruit Type, Quantity, Amount/Kg, Total Amount, Actions (Track, P/L buttons).
- **Requirement**: Group stocks by `dateIn`, aggregate quantities and amounts, and provide a single PDF download for the date.

### Plan:
1. **Frontend Changes (StockTrackerTab.jsx)**:
   - Group stock tracking records by `dateIn` on the frontend.
   - For each date group, aggregate: total quantity, total amount, and collect unique fruit types.
   - Modify table headers to: Date In, Fruit Types, Total Quantity, Total Amount, Actions.
   - Add a "Download PDF" button in Actions that calls the combined PDF endpoint for that date.
   - Remove or adjust individual stock actions (Track, P/L) since they are now grouped.

2. **Backend Changes (if needed)**:
   - Verify `StockTrackingCombinedPDFResource` works for dateIn dates.
   - No changes needed as combined PDF already exists.

### Dependent Files to be Edited:
- `frontend/src/components/StockTrackerTab.jsx`: Main file to modify table display and grouping logic.

### Followup Steps:
- Test the grouped table display.
- Test PDF download functionality.
- Ensure no breaking changes to existing features.

### Completed Steps:
- [x] Modified `frontend/src/components/StockTrackerTab.jsx` to group stocks that come out on the same date.
- [x] Updated table headers to: Stock Names, Date Out, Total Amount Purchased, Total Amount Sold, Actions.
- [x] Added combined PDF download button for each date group (stocks that came out on the same day).
- [x] Changed amount sold calculation to come from actual sales data instead of aggregated revenue.
- [x] Added sales data fetching and mapping to calculate real sales amounts per stock.
