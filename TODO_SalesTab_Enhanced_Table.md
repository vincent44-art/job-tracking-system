# TODO: Integrate Enhanced Seller Fruits Table into SalesTab

## Overview
Update SalesTab.jsx to use the Enhanced SellerFruitsTable, replacing the custom basic table. Retain add form, clear all sales, and daily PDF features. Fetch and display data from the database via existing API.

## Steps

- [ ] Step 1: Update imports in frontend/src/components/SalesTab.jsx
  - Add imports for SellerFruitsTable from '../seller/SellerFruitsTable'
  - Add formatDateCell function (similar to SellerDashboard)
  - Import jsPDF and autoTable if needed for PDF (but use enhanced table's PDF)
  - Import SellerFruitsForm if adding edit support

- [ ] Step 2: Add handleEdit function
  - Implement handleEdit to set form data for editing a seller fruit record
  - Update form to handle edit mode (pass editingFruit to SellerFruitsForm)

- [ ] Step 3: Modify the render section in SalesTab.jsx
  - Keep the header with "Seller Fruits Management", Add button, Clear All button
  - Keep the showForm conditional for adding/editing
  - Remove the custom search input (enhanced table has built-in search)
  - Replace the entire custom card with table (grouped by date) with <SellerFruitsTable sellerFruits={sellerFruits} onEdit={handleEdit} onRefresh={loadSellerFruits} formatKenyanCurrency={formatKenyanCurrency} formatDateCell={formatDateCell} downloadSellerFruitsPDF={downloadDailyReport} />
  - For daily PDF, adapt: Add a date input above the table to select date and call downloadDailyReport

- [ ] Step 4: Remove obsolete code
  - Delete groupedSellerFruits, sortedDates, and the custom table rendering logic
  - Clean up any unused variables or functions related to the old table

- [ ] Step 5: Update form handling for edit
  - Modify handleSubmit to handle both create and update (use PUT for edit via API)
  - Add updateSellerFruit function in api/sellerFruits.js if needed (assume it exists or add)

- [ ] Step 6: Test the integration
  - Run frontend with `cd frontend && npm run dev`
  - Navigate to SalesTab, verify data loads from DB, enhanced features work (search, sort, filter, pagination, export)
  - Test add, edit, delete, clear all, PDF download
  - Check for errors in console

## Notes
- Data fetching via fetchSellerFruits remains the same.
- If daily grouping is needed, consider enhancing SellerFruitsTable later.
- After all steps, mark complete and remove this TODO.
