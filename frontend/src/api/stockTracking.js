const BASE_URL = 'http://127.0.0.1:5000/api';

export async function fetchStockTracking(token) {
  const res = await fetch(`${BASE_URL}/stock-tracking`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to fetch stock tracking');
  return await res.json();
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
