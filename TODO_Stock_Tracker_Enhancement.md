# Stock Tracker Enhancement Plan

## Overview
Enhance the stock tracker to show detailed financial tables for each stock including purchase costs, usage, transport expenses, other expenses, revenue, and profit/loss calculations.

## Steps to Complete:

### Backend Changes
1. [ ] Add new aggregated endpoint in `backend/resources/stock_tracking.py`
   - Create `/api/stock_tracking/aggregated` endpoint
   - Aggregate data from multiple tables (stock_tracking, sales, driver_expenses, other_expenses, stock_movements)
   - Calculate profit/loss for each stock

2. [ ] Update stock tracking resource to include new aggregation logic
   - Link expenses to stocks using date ranges and stock_name
   - Aggregate sales by fruit_type
   - Calculate storage usage from stock movements

### Frontend Changes
3. [ ] Update `frontend/src/components/StockTrackerTab.jsx`
   - Add new API call for aggregated data
   - Create Stock Expenses Table component
   - Create Fruit Profitability Table component
   - Update UI to display both tables

4. [ ] Update `frontend/src/api/stockTracking.js`
   - Add function to fetch aggregated stock data

### Testing and Validation
5. [ ] Test the new functionality
   - Verify data accuracy in calculations
   - Handle edge cases (missing data, no expenses, etc.)
   - Ensure UI displays correctly

## Current Status: In Progress
- [x] Plan approved by user
- [ ] Backend implementation started
- [ ] Frontend implementation pending
- [ ] Testing pending
