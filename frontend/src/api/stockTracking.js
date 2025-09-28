const BASE_URL = 'http://127.0.0.1:5000/api';

export async function fetchStockTracking(token) {
  try {
    console.log('fetchStockTracking: Making API call to /stock-tracking');
    const res = await fetch(`${BASE_URL}/stock-tracking`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      console.error('fetchStockTracking: API call failed with status:', res.status);
      throw new Error(`Failed to fetch stock tracking: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('fetchStockTracking: Response received:', data);
    return data;
  } catch (error) {
    console.error('fetchStockTracking: API call failed:', error);
    throw error;
  }
}

export async function addStockTracking(record, token) {
  const res = await fetch(`${BASE_URL}/stock-tracking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error('Failed to add stock tracking record');
  return await res.json();
}

export async function clearStockTracking(token) {
  const res = await fetch(`${BASE_URL}/stock-tracking/clear`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to clear stock tracking');
  return await res.json();
}

export async function fetchStockTrackingAggregated(token) {
  const res = await fetch(`${BASE_URL}/stock_tracking/aggregated`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to fetch aggregated stock tracking data');
  return await res.json();
}
