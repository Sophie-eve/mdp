import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { evaluateReading } from '../utils/thresholds';

/**
 * 8 Seed/Demo readings matching the public.readings schema
 * Only used as an offline preview if Supabase credentials have not been configured yet,
 * ensuring the application can be previewed without crashing.
 */
export const DEMO_READINGS = [
  {
    id: 'demo-1',
    device_id: 'ESP32-NODE-01',
    tds: 210,
    ph: 7.2,
    turbidity: 0.6,
    temp: 23.5,
    status: 'SAFE',
    is_simulated: true,
    recorded_at: '2026-10-13T08:00:00.000Z',
  },
  {
    id: 'demo-2',
    device_id: 'ESP32-NODE-01',
    tds: 245,
    ph: 7.4,
    turbidity: 0.8,
    temp: 24.1,
    status: 'SAFE',
    is_simulated: true,
    recorded_at: '2026-10-13T09:30:00.000Z',
  },
  {
    id: 'demo-3',
    device_id: 'ESP32-NODE-01',
    tds: 310,
    ph: 7.1,
    turbidity: 1.2,
    temp: 24.8,
    status: 'WARNING',
    is_simulated: true,
    recorded_at: '2026-10-13T11:00:00.000Z',
  },
  {
    id: 'demo-4',
    device_id: 'ESP32-NODE-01',
    tds: 290,
    ph: 6.8,
    turbidity: 0.9,
    temp: 25.2,
    status: 'SAFE',
    is_simulated: true,
    recorded_at: '2026-10-13T12:30:00.000Z',
  },
  {
    id: 'demo-5',
    device_id: 'ESP32-NODE-01',
    tds: 580,
    ph: 6.3,
    turbidity: 2.1,
    temp: 26.0,
    status: 'WARNING',
    is_simulated: true,
    recorded_at: '2026-10-13T14:00:00.000Z',
  },
  {
    id: 'demo-6',
    device_id: 'ESP32-NODE-01',
    tds: 420,
    ph: 7.6,
    turbidity: 1.5,
    temp: 25.5,
    status: 'WARNING',
    is_simulated: true,
    recorded_at: '2026-10-13T15:30:00.000Z',
  },
  {
    id: 'demo-7',
    device_id: 'ESP32-NODE-01',
    tds: 350,
    ph: 7.3,
    turbidity: 0.8,
    temp: 24.6,
    status: 'SAFE',
    is_simulated: true,
    recorded_at: '2026-10-13T17:00:00.000Z',
  },
  {
    id: 'demo-8',
    device_id: 'ESP32-NODE-01',
    tds: 280,
    ph: 7.2,
    turbidity: 0.7,
    temp: 23.9,
    status: 'SAFE',
    is_simulated: true,
    recorded_at: '2026-10-13T18:30:00.000Z',
  },
];

/**
 * Fetch historical readings from Supabase public.readings table.
 * Ordered by recorded_at descending by default.
 */
export function sortReadingsChronologically(readings = [], ascending = true) {
  return [...readings].sort((a, b) => {
    const timeA = new Date(a.recorded_at).getTime();
    const timeB = new Date(b.recorded_at).getTime();
    if (timeA !== timeB) {
      return ascending ? timeA - timeB : timeB - timeA;
    }
    const idA = String(a.id ?? '');
    const idB = String(b.id ?? '');
    return ascending 
      ? idA.localeCompare(idB, undefined, { numeric: true })
      : idB.localeCompare(idA, undefined, { numeric: true });
  });
}

/**
 * Fetch historical readings from Supabase public.readings table.
 * Sorted by recorded_at with id as a strict tie-breaker to prevent order flipping.
 */
export async function getReadings({ limit = 100, ascending = false } = {}) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      data: sortReadingsChronologically(DEMO_READINGS, ascending),
      isFallback: true,
      error: 'Supabase credentials are not configured yet. Showing offline preview readings.',
    };
  }

  try {
    const { data, error } = await supabase
      .from('readings')
      .select('*')
      .order('recorded_at', { ascending })
      .order('id', { ascending })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      return {
        data: [],
        error: error.message || 'Failed to fetch water quality readings.',
        isFallback: false,
      };
    }

    return {
      data: sortReadingsChronologically(data || [], ascending),
      error: null,
      isFallback: false,
    };
  } catch (err) {
    console.error('Network or client error fetching readings:', err);
    return {
      data: [],
      error: err.message || 'Network error connecting to Supabase database.',
      isFallback: false,
    };
  }
}

/**
 * Fetch the single latest reading
 */
export async function getLatestReading() {
  const result = await getReadings({ limit: 1, ascending: false });
  if (result.error && !result.isFallback) {
    return { data: null, error: result.error, isFallback: false };
  }
  return {
    data: result.data && result.data.length > 0 ? result.data[0] : null,
    error: result.error,
    isFallback: result.isFallback,
  };
}

/**
 * Real-time subscription to new readings
 */
export function subscribeToNewReadings(callback) {
  if (!isSupabaseConfigured || !supabase) {
    return { unsubscribe: () => {} };
  }

  const channel = supabase
    .channel('public:readings')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'readings' },
      (payload) => {
        if (typeof callback === 'function') {
          callback(payload);
        }
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

/**
 * Future backend abstraction: Fetch from Python FastAPI endpoint
 * if VITE_BACKEND_API_URL is configured
 */
export async function fetchFromFastApiBackend() {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/api/readings/latest`);
    if (!response.ok) throw new Error(`FastAPI responded with HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('FastAPI backend connection warning:', err.message);
    return null;
  }
}
