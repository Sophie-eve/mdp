import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getReadings, subscribeToNewReadings, sortReadingsChronologically } from '../services/readingService';
import { simulationEngine } from '../services/simulationService';
import { generateAlertsFromReadings, acknowledgeAlert as markAck, acknowledgeAllAlerts as markAllAck } from '../services/alertService';
import { evaluateReading } from '../utils/thresholds';
import { isSupabaseConfigured } from '../lib/supabase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Mode: 'SIMULATION' (interactive realistic demo) or 'DATABASE' (actual Supabase public.readings)
  const [dataSourceMode, setDataSourceMode] = useState('SIMULATION');
  const [simulationSpeedSec, setSimulationSpeedSec] = useState(3);
  const [isSimPaused, setIsSimPaused] = useState(false);
  const [activeContamination, setActiveContamination] = useState(null);
  const [emergencySms, setEmergencySms] = useState(null);

  const dismissEmergencySms = useCallback(() => {
    setEmergencySms(null);
  }, []);

  const triggerEmergencySmsDispatch = useCallback((type, value, unit) => {
    let userPhone = '+91 98765 43210';
    try {
      const stored = JSON.parse(localStorage.getItem('aquasense_user_profile') || '{}');
      if (stored.phone_number) userPhone = stored.phone_number;
    } catch (e) {}

    const hazardTitle = type === 'tds' ? 'TDS Concentration' : type === 'ph' ? 'pH Chemical Acidity' : 'Turbidity Cloudiness';
    const message = `🚨 [AquaSense CRITICAL ALERT] Severe hazard detected on ESP32-NODE-01! ${hazardTitle} spiked to ${value} ${unit} (Safety Threshold Breached). Immediate filtration shutdown advised.`;

    const smsRecord = {
      id: 'sms-' + Date.now(),
      type,
      value,
      unit,
      recipientPhone: userPhone,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'DISPATCHED_TO_CARRIER',
      provider: 'Twilio / Fast2SMS Gateway'
    };

    setEmergencySms(smsRecord);

    // Call FastAPI backend in background if running
    fetch('http://localhost:8000/api/alerts/test-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: userPhone,
        custom_message: message
      })
    }).catch(() => {
      // Gracefully handles if local python server is offline
    });
  }, []);

  // Stored readings: sorted chronologically (oldest to newest)
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [deviceStatus, setDeviceStatus] = useState('ONLINE');

  // Supabase raw readings storage (for when user toggles to DATABASE mode)
  const [databaseReadings, setDatabaseReadings] = useState([]);

  // Fetch actual historical data from Supabase
  const fetchDatabaseData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getReadings({ limit: 100, ascending: true });
      if (result.error && !result.isFallback) {
        setError(result.error);
        setDatabaseReadings([]);
      } else {
        const sorted = sortReadingsChronologically(result.data || [], true);
        setDatabaseReadings(sorted);
        setLastSyncTime(new Date());

        if (dataSourceMode === 'DATABASE') {
          setReadings(sorted);
        }
      }
    } catch (err) {
      setError(err.message || 'Error fetching database records.');
    } finally {
      setLoading(false);
    }
  }, [dataSourceMode]);

  // Initial load: start with realistic initial history in SIMULATION mode and query Supabase
  useEffect(() => {
    // Generate initial history for smooth initial charts
    const initialHistory = simulationEngine.generateInitialHistory(20, 3);
    setReadings(initialHistory);
    setLastSyncTime(new Date());
    setLoading(false);

    // Also fetch database records in background so they are ready if user switches mode
    if (isSupabaseConfigured) {
      fetchDatabaseData();
    }
  }, [fetchDatabaseData]);

  // Realtime subscription for Supabase public.readings
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const sub = subscribeToNewReadings((payload) => {
      console.log('⚡ Supabase realtime notification:', payload);
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setDatabaseReadings((prev) => {
        let updated = [...prev];
        if (eventType === 'INSERT' && newRecord) {
          const exists = updated.some((r) => r.id === newRecord.id);
          if (exists) {
            updated = updated.map((r) => (r.id === newRecord.id ? newRecord : r));
          } else {
            updated.push(newRecord);
          }
        } else if (eventType === 'UPDATE' && newRecord) {
          updated = updated.map((r) => (r.id === newRecord.id ? newRecord : r));
        } else if (eventType === 'DELETE' && oldRecord) {
          updated = updated.filter((r) => r.id !== oldRecord.id);
        }
        return sortReadingsChronologically(updated, true);
      });

      // If currently viewing DATABASE mode, update active readings immediately
      if (dataSourceMode === 'DATABASE') {
        setReadings((prev) => {
          let updated = [...prev];
          if (eventType === 'INSERT' && newRecord) {
            updated.push(newRecord);
          } else if (eventType === 'UPDATE' && newRecord) {
            updated = updated.map((r) => (r.id === newRecord.id ? newRecord : r));
          } else if (eventType === 'DELETE' && oldRecord) {
            updated = updated.filter((r) => r.id !== oldRecord.id);
          }
          return sortReadingsChronologically(updated, true);
        });
        setLastSyncTime(new Date());
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [dataSourceMode]);

  // Deterministic simulation interval (Single timer guard)
  useEffect(() => {
    if (dataSourceMode !== 'SIMULATION' || isSimPaused) {
      return;
    }

    const intervalMs = simulationSpeedSec * 1000;
    const timer = setInterval(() => {
      const nextReading = simulationEngine.getNextReading();

      setReadings((prev) => {
        // Keep a rolling window of the last 40 readings for responsive charting
        const updated = [...prev, nextReading];
        if (updated.length > 50) {
          return updated.slice(updated.length - 40);
        }
        return updated;
      });

      setLastSyncTime(new Date());
      setDeviceStatus('ONLINE');
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [dataSourceMode, isSimPaused, simulationSpeedSec]);

  // Mode switcher handler
  const handleSetMode = (newMode) => {
    setDataSourceMode(newMode);
    if (newMode === 'DATABASE') {
      if (databaseReadings.length > 0) {
        setReadings(databaseReadings);
      } else {
        fetchDatabaseData();
      }
    } else {
      // Return to simulation
      if (readings.length === 0 || !readings[readings.length - 1]?.is_simulated) {
        setReadings(simulationEngine.generateInitialHistory(20, 3));
      }
    }
  };

  // Contamination presentation controls
  const handleTriggerContamination = (type) => {
    setActiveContamination(type);
    simulationEngine.triggerContamination(type);
    if (dataSourceMode !== 'SIMULATION') {
      handleSetMode('SIMULATION');
    }

    // Immediately generate the spiked reading so there is zero delay
    const immediateReading = simulationEngine.getNextReading();
    setReadings((prev) => {
      const updated = [...prev, immediateReading];
      return updated.length > 50 ? updated.slice(updated.length - 40) : updated;
    });
    setLastSyncTime(new Date());

    // Immediately trigger the emergency SMS dispatch alert
    const val = type === 'tds' ? immediateReading.tds : type === 'ph' ? immediateReading.ph : immediateReading.turbidity;
    const unit = type === 'tds' ? 'ppm' : type === 'ph' ? '' : 'NTU';
    triggerEmergencySmsDispatch(type, val, unit);
  };

  const handleResetDemo = () => {
    setActiveContamination(null);
    simulationEngine.resetToNormal();
    dismissEmergencySms();
    // Generate clean baseline readings
    setReadings(simulationEngine.generateInitialHistory(20, 3));
    setDeviceStatus('ONLINE');
  };

  // Single consistent source of truth: latest reading is always the chronologically newest
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  // Evaluate latest reading
  const evaluation = latestReading ? evaluateReading(latestReading) : null;
  const overallStatus = evaluation?.overallStatus || 'SENSOR ERROR';

  // Check data freshness for DATABASE mode (if older than 15 minutes)
  const isStale = Boolean(
    dataSourceMode === 'DATABASE' &&
    latestReading &&
    (Date.now() - new Date(latestReading.recorded_at).getTime()) > 15 * 60 * 1000
  );

  // Transition-aware alerts
  const alerts = generateAlertsFromReadings(readings);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged && !a.recovered);

  const handleAcknowledgeAlert = (alertId, status = true) => {
    markAck(alertId, status);
    setReadings((prev) => [...prev]);
  };

  const handleAcknowledgeAll = () => {
    markAllAck(alerts);
    setReadings((prev) => [...prev]);
  };

  const value = {
    // Core data
    readings,
    latestReading,
    overallStatus,
    evaluation,
    alerts,
    unacknowledgedAlertsCount: unacknowledgedAlerts.length,
    loading,
    error,
    lastSyncTime,
    deviceStatus: isStale ? 'STALE / STANDBY' : deviceStatus,
    isStale,
    isSimulated: Boolean(latestReading?.is_simulated || dataSourceMode === 'SIMULATION'),

    // Operational mode
    dataSourceMode,
    setDataSourceMode: handleSetMode,
    simulationSpeedSec,
    setSimulationSpeedSec,
    isSimPaused,
    setIsSimPaused,

    // Presentation & Contamination controls
    activeContamination,
    triggerContamination: handleTriggerContamination,
    resetDemo: handleResetDemo,

    // Emergency SMS alerts on spikes
    emergencySms,
    dismissEmergencySms,
    triggerEmergencySmsDispatch,

    // Database actions
    refreshDatabase: fetchDatabaseData,
    acknowledgeAlert: handleAcknowledgeAlert,
    acknowledgeAllAlerts: handleAcknowledgeAll,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
