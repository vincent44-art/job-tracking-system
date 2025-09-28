# PurchaserDashboard Runtime Error Fix

## Issue
Runtime error: "Cannot read properties of undefined (reading 'toLowerCase')" in PurchaserDashboard component

## Root Cause
Missing null/undefined checks before calling `toLowerCase()` on `fruitType` and `buyerName` properties in the table filtering logic

## Plan
1. [x] Fix the filtering logic in table rendering (lines 318-322)
2. [x] Add null checks before calling `toLowerCase()` on `fruitType` and `buyerName`
3. [ ] Test the fix by running the application
4. [ ] Verify search functionality works with null/undefined values

## Changes Made
- Updated the filter logic to safely handle undefined/null values
- Added proper null checking before string operations
