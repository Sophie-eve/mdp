/**
 * AquaSense Frontend Service for Custom SMS Notification Gateway
 * Connects to FastAPI backend at http://localhost:8000/api/sms/*
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

async function safeFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: 'Backend gateway connection failed. Please ensure fastapi_backend.py is running on port 8000.',
    };
  }
}

export async function fetchSmsStatus() {
  return await safeFetch('/api/sms/status');
}

export async function fetchSmsPreferences() {
  return await safeFetch('/api/sms/preferences');
}

export async function saveSmsPreferences(preferences) {
  return await safeFetch('/api/sms/preferences', {
    method: 'POST',
    body: JSON.stringify(preferences),
  });
}

export async function triggerTestSms(phoneNumber = null) {
  return await safeFetch('/api/sms/test', {
    method: 'POST',
    body: JSON.stringify(phoneNumber ? { phone_number: phoneNumber } : {}),
  });
}

export async function fetchSmsHistory() {
  return await safeFetch('/api/sms/history');
}
