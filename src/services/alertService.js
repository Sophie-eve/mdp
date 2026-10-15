/**
 * Transition-Aware Water Quality Alert Service
 * College Project: IoT-Based Smart Water Quality Monitoring System
 * 
 * Features:
 * - Edge-triggered: Generates alerts on state transitions (SAFE -> WARNING / CRITICAL)
 * - Anti-spam: Does not generate duplicate alerts for consecutive readings in the same state
 * - Recovery tracking: Marks incidents as RECOVERED when parameters return to SAFE
 * - Local acknowledgement persistence
 */

import { checkTds, checkPh, checkTurbidity, checkTemp } from '../utils/thresholds';

const ACK_STORAGE_KEY = 'aquasense_acknowledged_alerts';

function getAcknowledgedSet() {
  try {
    const raw = localStorage.getItem(ACK_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveAcknowledgedSet(set) {
  try {
    localStorage.setItem(ACK_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save acknowledged alerts', e);
  }
}

/**
 * Generate transition-based alert incidents from chronological readings
 * @param {Array} readings Chronologically sorted array (oldest to newest)
 * @returns {Array} List of incidents sorted newest first
 */
export function generateAlertsFromReadings(readings = []) {
  const acknowledgedSet = getAcknowledgedSet();
  if (!readings || readings.length === 0) return [];

  // Sort chronological for incident scanning (oldest to newest)
  const chrono = [...readings].sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

  const parameters = [
    { key: 'tds', name: 'TDS', check: checkTds, unit: 'ppm' },
    { key: 'ph', name: 'pH', check: checkPh, unit: '' },
    { key: 'turbidity', name: 'Turbidity', check: checkTurbidity, unit: 'NTU' },
    { key: 'temp', name: 'Temperature', check: checkTemp, unit: '°C' },
  ];

  const incidents = [];

  parameters.forEach((param) => {
    let activeIncident = null;

    chrono.forEach((r, idx) => {
      const val = r[param.key];
      const checkResult = param.check(val);
      const isBreached = checkResult.status === 'WARNING' || checkResult.status === 'CRITICAL' || checkResult.status === 'SENSOR ERROR';
      const timestamp = r.recorded_at;

      if (isBreached) {
        if (!activeIncident) {
          // Transition: SAFE -> BREACH (New Incident)
          const incidentId = `inc-${param.key}-${r.id || idx}`;
          activeIncident = {
            id: incidentId,
            parameter: param.name,
            severity: checkResult.status,
            initialValue: val !== null && val !== undefined ? `${val} ${param.unit}`.trim() : 'N/A',
            latestValue: val !== null && val !== undefined ? `${val} ${param.unit}`.trim() : 'N/A',
            message: checkResult.message,
            startTime: timestamp,
            lastObservedTime: timestamp,
            recovered: false,
            recoveredAt: null,
            acknowledged: acknowledgedSet.has(incidentId),
            deviceId: r.device_id || 'ESP32-NODE-01',
          };
        } else {
          // Continuing breach: Update latest observation without creating duplicate
          activeIncident.lastObservedTime = timestamp;
          activeIncident.latestValue = val !== null && val !== undefined ? `${val} ${param.unit}`.trim() : 'N/A';
          // If severity escalated (WARNING -> CRITICAL)
          if (activeIncident.severity === 'WARNING' && checkResult.status === 'CRITICAL') {
            activeIncident.severity = 'CRITICAL';
            activeIncident.message = checkResult.message;
          }
        }
      } else {
        // Parameter is SAFE
        if (activeIncident) {
          // Transition: BREACH -> SAFE (Recovery)
          activeIncident.recovered = true;
          activeIncident.recoveredAt = timestamp;
          incidents.push({ ...activeIncident });
          activeIncident = null;
        }
      }
    });

    // If an incident is still ongoing at the end of the readings stream
    if (activeIncident) {
      incidents.push(activeIncident);
    }
  });

  // Sort incidents: Active CRITICAL first, then Active WARNING, then newest startTime
  return incidents.sort((a, b) => {
    if (!a.recovered && b.recovered) return -1;
    if (a.recovered && !b.recovered) return 1;
    if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
    if (b.severity === 'CRITICAL' && a.severity !== 'CRITICAL') return 1;
    return new Date(b.startTime) - new Date(a.startTime);
  });
}

/**
 * Toggle acknowledgement on an alert incident
 */
export function acknowledgeAlert(alertId, acknowledged = true) {
  const set = getAcknowledgedSet();
  if (acknowledged) {
    set.add(alertId);
  } else {
    set.delete(alertId);
  }
  saveAcknowledgedSet(set);
  return Array.from(set);
}

/**
 * Acknowledge all active incidents
 */
export function acknowledgeAllAlerts(alerts = []) {
  const set = getAcknowledgedSet();
  alerts.forEach(a => set.add(a.id));
  saveAcknowledgedSet(set);
  return Array.from(set);
}
