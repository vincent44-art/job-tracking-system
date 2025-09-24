# TODO: Sales Tab Enhancements

## Completed Tasks
- [x] Replace "Creator Email" with "Seller Name" in the Enhanced Seller Fruits Table
- [x] Add totals for each stock after each stock group
- [x] Add PDF download column after each stock (integrated into total row)
- [x] Ensure table fetches data from seller_fruit database table
- [x] Display the email of the person who entered the data as the Seller Name

## Implementation Summary
The Enhanced Seller Fruits Table in `frontend/src/components/SalesTab.jsx` now:
- Fetches data from the `seller_fruit` table via the API
- Displays the creator's email as "Seller Name" (as requested)
- Groups entries by stock name
- Shows individual rows for each fruit entry
- Includes a total row after each stock group with:
  - Sum of all amounts for that stock
  - PDF download button for the entire stock
- Maintains existing functionality for individual row PDF downloads and deletions

## Next Steps
- [ ] User should refresh their browser to see the changes
- [ ] Test the updated table functionality
