/**
 * Water Quality Thresholds and Safety Evaluation Rules
 * College Project: IoT-Based Smart Water Quality Monitoring System
 * 
 * Rules:
 * - TDS (Total Dissolved Solids): WARNING > 500 ppm; CRITICAL > 2000 ppm
 * - pH: WARNING outside 6.5 - 8.5
 * - Turbidity: WARNING > 1 NTU; CRITICAL > 5 NTU
 * - Temperature: WARNING outside 10°C - 35°C
 * 
 * Priority: CRITICAL > WARNING > SAFE
 * Missing or invalid values evaluate to SENSOR ERROR (never SAFE).
 */

export const WATER_QUALITY_DISCLAIMER = "";

export const THRESHOLDS = {
  tds: {
    name: 'Total Dissolved Solids (TDS)',
    unit: 'ppm',
    idealMin: 50,
    warningMax: 500,
    criticalMax: 2000,
    description: 'Measures dissolved inorganic and organic substances in water.',
  },
  ph: {
    name: 'pH Level',
    unit: '',
    warningMin: 6.5,
    warningMax: 8.5,
    description: 'Measures hydrogen-ion concentration (acidity vs. alkalinity).',
  },
  turbidity: {
    name: 'Turbidity',
    unit: 'NTU',
    warningMax: 1.0,
    criticalMax: 5.0,
    description: 'Measures water clarity and suspended particulate matter.',
  },
  temp: {
    name: 'Water Temperature',
    unit: '°C',
    warningMin: 10.0,
    warningMax: 35.0,
    description: 'Influences dissolved oxygen and biological activity.',
  },
};

/**
 * Check TDS value
 * @param {number|null|undefined} v
 * @returns {{ status: 'SAFE'|'WARNING'|'CRITICAL'|'SENSOR ERROR', message: string }}
 */
export function checkTds(v) {
  if (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) {
    return { status: 'SENSOR ERROR', message: 'TDS sensor value is missing or invalid' };
  }
  const val = Number(v);
  if (val > 2000) {
    return { status: 'CRITICAL', message: `TDS is ${val} ppm (Critical threshold > 2000 ppm)` };
  }
  if (val > 500) {
    return { status: 'WARNING', message: `TDS is ${val} ppm (Warning threshold > 500 ppm)` };
  }
  return { status: 'SAFE', message: `TDS is ${val} ppm (Acceptable)` };
}

/**
 * Check pH value
 * @param {number|null|undefined} v
 * @returns {{ status: 'SAFE'|'WARNING'|'CRITICAL'|'SENSOR ERROR', message: string }}
 */
export function checkPh(v) {
  if (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0 || Number(v) > 14) {
    return { status: 'SENSOR ERROR', message: 'pH sensor value is missing or out of 0-14 scale' };
  }
  const val = Number(v);
  // pH outside 6.5-8.5 is WARNING
  if (val < 6.5 || val > 8.5) {
    // Extreme pH (<4 or >10) can also be flagged as CRITICAL for water safety
    if (val < 4.0 || val > 10.5) {
      return { status: 'CRITICAL', message: `pH is extremely abnormal at ${val.toFixed(2)}` };
    }
    return { status: 'WARNING', message: `pH is ${val.toFixed(2)} (Acceptable range: 6.5 - 8.5)` };
  }
  return { status: 'SAFE', message: `pH is ${val.toFixed(2)} (Optimal neutral/balanced)` };
}

/**
 * Check Turbidity value
 * @param {number|null|undefined} v
 * @returns {{ status: 'SAFE'|'WARNING'|'CRITICAL'|'SENSOR ERROR', message: string }}
 */
export function checkTurbidity(v) {
  if (v === null || v === undefined || isNaN(Number(v)) || Number(v) < 0) {
    return { status: 'SENSOR ERROR', message: 'Turbidity sensor value is missing or invalid' };
  }
  const val = Number(v);
  if (val > 5.0) {
    return { status: 'CRITICAL', message: `Turbidity is ${val.toFixed(2)} NTU (Critical threshold > 5 NTU)` };
  }
  if (val > 1.0) {
    return { status: 'WARNING', message: `Turbidity is ${val.toFixed(2)} NTU (Warning threshold > 1 NTU)` };
  }
  return { status: 'SAFE', message: `Turbidity is ${val.toFixed(2)} NTU (Clear)` };
}

/**
 * Check Temperature value
 * @param {number|null|undefined} v
 * @returns {{ status: 'SAFE'|'WARNING'|'CRITICAL'|'SENSOR ERROR', message: string }}
 */
export function checkTemp(v) {
  if (v === null || v === undefined || isNaN(Number(v))) {
    return { status: 'SENSOR ERROR', message: 'Temperature sensor value is missing or invalid' };
  }
  const val = Number(v);
  if (val < 10.0 || val > 35.0) {
    return { status: 'WARNING', message: `Temperature is ${val.toFixed(1)}°C (Acceptable range: 10°C - 35°C)` };
  }
  return { status: 'SAFE', message: `Temperature is ${val.toFixed(1)}°C (Normal)` };
}

/**
 * Evaluate reading across all parameters and derive overall status
 * CRITICAL takes priority over WARNING.
 * Any SENSOR ERROR prevents SAFE.
 */
export function evaluateReading(reading) {
  if (!reading) {
    return {
      overallStatus: 'SENSOR ERROR',
      tds: { status: 'SENSOR ERROR', message: 'No reading available' },
      ph: { status: 'SENSOR ERROR', message: 'No reading available' },
      turbidity: { status: 'SENSOR ERROR', message: 'No reading available' },
      temp: { status: 'SENSOR ERROR', message: 'No reading available' },
      issues: ['No sensor data available'],
    };
  }

  const tdsEval = checkTds(reading.tds);
  const phEval = checkPh(reading.ph);
  const turbEval = checkTurbidity(reading.turbidity);
  const tempEval = checkTemp(reading.temp);

  const statuses = [tdsEval.status, phEval.status, turbEval.status, tempEval.status];
  const issues = [];

  if (tdsEval.status !== 'SAFE') issues.push(tdsEval.message);
  if (phEval.status !== 'SAFE') issues.push(phEval.message);
  if (turbEval.status !== 'SAFE') issues.push(turbEval.message);
  if (tempEval.status !== 'SAFE') issues.push(tempEval.message);

  const triggeredParameters = [];
  if (tdsEval.status !== 'SAFE') triggeredParameters.push({ param: 'TDS', status: tdsEval.status, value: reading.tds, unit: 'ppm', message: tdsEval.message });
  if (phEval.status !== 'SAFE') triggeredParameters.push({ param: 'pH', status: phEval.status, value: reading.ph, unit: '', message: phEval.message });
  if (turbEval.status !== 'SAFE') triggeredParameters.push({ param: 'Turbidity', status: turbEval.status, value: reading.turbidity, unit: 'NTU', message: turbEval.message });
  if (tempEval.status !== 'SAFE') triggeredParameters.push({ param: 'Temperature', status: tempEval.status, value: reading.temp, unit: '°C', message: tempEval.message });

  let overallStatus = 'SAFE';

  if (statuses.includes('CRITICAL')) {
    overallStatus = 'CRITICAL';
  } else if (statuses.includes('WARNING')) {
    overallStatus = 'WARNING';
  } else if (statuses.includes('SENSOR ERROR')) {
    overallStatus = 'SENSOR ERROR';
  }

  return {
    overallStatus,
    tds: tdsEval,
    ph: phEval,
    turbidity: turbEval,
    temp: tempEval,
    issues,
    triggeredParameters,
  };
}

/**
 * Color metadata helper for UI badges and cards
 */
export function getStatusTheme(status) {
  const norm = String(status || '').toUpperCase();
  switch (norm) {
    case 'SAFE':
    case 'EXCELLENT':
    case 'GOOD':
      return {
        key: 'SAFE',
        label: 'SAFE',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        text: '#047857',
        solid: '#10b981',
        iconName: 'CheckCircle2',
      };
    case 'WARNING':
    case 'FAIR':
    case 'POOR':
      return {
        key: 'WARNING',
        label: 'WARNING',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        text: '#b45309',
        solid: '#f59e0b',
        iconName: 'AlertTriangle',
      };
    case 'CRITICAL':
    case 'UNSAFE':
      return {
        key: 'CRITICAL',
        label: 'CRITICAL',
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'rgba(239, 68, 68, 0.3)',
        text: '#b91c1c',
        solid: '#ef4444',
        iconName: 'AlertOctagon',
      };
    case 'SENSOR ERROR':
    default:
      return {
        key: 'SENSOR ERROR',
        label: 'SENSOR ERROR',
        bg: 'rgba(100, 116, 139, 0.1)',
        border: 'rgba(100, 116, 139, 0.3)',
        text: '#475569',
        solid: '#64748b',
        iconName: 'HelpCircle',
      };
  }
}
