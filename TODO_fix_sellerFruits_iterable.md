# Fix data.sellerFruits is not iterable error

## Problem
In ReportsTabAnalytics component, the error "data.sellerFruits is not iterable" occurs because data.sellerFruits is not an array when trying to spread it in calculateBusinessMetrics.

## Root Cause
In the useEffect, when setting data.sellerFruits:
```javascript
sellerFruits: Array.isArray(sellerFruitsRes.data?.data) ? sellerFruitsRes.data.data : sellerFruitsRes.data || []
```

sellerFruitsRes is already response.data from fetchSellerFruits, so sellerFruitsRes.data is undefined. If sellerFruitsRes is not an array (e.g., an object), it gets set to that object instead of [].

## Solution
Change the setData line for sellerFruits to match the pattern for sales:
```javascript
sellerFruits: Array.isArray(sellerFruitsRes) ? sellerFruitsRes : []
```

This ensures sellerFruits is always an array.

## Files to Edit
- frontend/src/components/ReportsTab_analytics.jsx

## Steps
1. Edit the setData line in useEffect.
2. Test that the component loads without error.
