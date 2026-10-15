/**
 * Realistic Telemetry Simulation Engine
 * College Project: IoT-Based Smart Water Quality Monitoring System
 * 
 * Generates deterministic, gradual telemetry with realistic drift
 * and scripted contamination demonstrations.
 */

import { evaluateReading } from '../utils/thresholds';

// Baseline parameters for normal, safe water operation
export const BASELINE = {
  tds: 220,       // ppm (Safe is 0-500)
  ph: 7.32,       // (Safe is 6.5-8.5)
  turbidity: 0.65,// NTU (Safe is 0-1.0)
  temp: 23.8,     // °C (Safe is 10-35)
};

// Current simulation state
class SimulationEngine {
  constructor() {
    this.current = { ...BASELINE };
    this.contamination = null; // null | { type: 'tds' | 'ph' | 'turbidity', step: number, maxSteps: number }
    this.stepCount = 0;
  }

  resetToNormal() {
    this.current = {
      tds: BASELINE.tds + (Math.random() * 6 - 3),
      ph: BASELINE.ph + (Math.random() * 0.08 - 0.04),
      turbidity: BASELINE.turbidity + (Math.random() * 0.08 - 0.04),
      temp: BASELINE.temp + (Math.random() * 0.2 - 0.1),
    };
    this.contamination = null;
  }

  triggerContamination(type = 'tds') {
    this.contamination = {
      type,
      step: 0,
      maxSteps: 6,
    };
    // Immediately elevate values to the critical hazard zone
    if (type === 'tds') {
      this.current.tds = 2240 + Math.random() * 80;
    } else if (type === 'ph') {
      this.current.ph = 3.65 - Math.random() * 0.2;
    } else if (type === 'turbidity') {
      this.current.turbidity = 5.85 + Math.random() * 0.6;
    }
  }

  clearContamination() {
    this.contamination = null;
  }

  getNextReading() {
    this.stepCount += 1;

    if (this.contamination) {
      this.applyContaminationStep();
    } else {
      this.applyNormalDrift();
    }

    // Format numbers
    const finalTds = Math.round(this.current.tds);
    const finalPh = Number(this.current.ph.toFixed(2));
    const finalTurbidity = Number(this.current.turbidity.toFixed(2));
    const finalTemp = Number(this.current.temp.toFixed(1));

    const evalResult = evaluateReading({
      tds: finalTds,
      ph: finalPh,
      turbidity: finalTurbidity,
      temp: finalTemp,
    });

    const now = new Date();

    return {
      id: `sim-${Date.now()}-${this.stepCount}`,
      device_id: 'ESP32-NODE-01 (SIMULATED)',
      tds: finalTds,
      ph: finalPh,
      turbidity: finalTurbidity,
      temp: finalTemp,
      status: evalResult.overallStatus,
      is_simulated: true,
      recorded_at: now.toISOString(),
      contaminationEvent: this.contamination ? this.contamination.type : null,
    };
  }

  applyNormalDrift() {
    // Gentle Brownian walk with mean-reversion toward baseline
    // TDS: small drift of +/- 1 to 2 ppm, bounded to [200, 250]
    const tdsDiff = BASELINE.tds - this.current.tds;
    const tdsNoise = (Math.random() - 0.5) * 3;
    this.current.tds += tdsNoise + tdsDiff * 0.1;
    this.current.tds = Math.max(195, Math.min(265, this.current.tds));

    // pH: drift +/- 0.02, bounded to [7.10, 7.55]
    const phDiff = BASELINE.ph - this.current.ph;
    const phNoise = (Math.random() - 0.5) * 0.04;
    this.current.ph += phNoise + phDiff * 0.1;
    this.current.ph = Math.max(7.10, Math.min(7.55, this.current.ph));

    // Turbidity: drift +/- 0.03, bounded to [0.45, 0.85]
    const turbDiff = BASELINE.turbidity - this.current.turbidity;
    const turbNoise = (Math.random() - 0.5) * 0.04;
    this.current.turbidity += turbNoise + turbDiff * 0.1;
    this.current.turbidity = Math.max(0.45, Math.min(0.85, this.current.turbidity));

    // Temp: drift +/- 0.05, bounded to [22.8, 24.8]
    const tempDiff = BASELINE.temp - this.current.temp;
    const tempNoise = (Math.random() - 0.5) * 0.08;
    this.current.temp += tempNoise + tempDiff * 0.1;
    this.current.temp = Math.max(22.8, Math.min(24.8, this.current.temp));
  }

  applyContaminationStep() {
    const { type, step } = this.contamination;
    this.contamination.step += 1;

    if (type === 'tds') {
      // Controlled sequence: 230 -> 480 (pre-warning) -> 750 (WARNING) -> 1300 (WARNING) -> 1800 (WARNING) -> 2250 (CRITICAL)
      const targetTdsByStep = [480, 750, 1250, 1750, 2250, 2350];
      const target = targetTdsByStep[Math.min(step, targetTdsByStep.length - 1)];
      this.current.tds += (target - this.current.tds) * 0.75 + (Math.random() * 20 - 10);
    } else if (type === 'ph') {
      // Controlled acid spill: 7.3 -> 6.7 -> 6.1 (WARNING) -> 5.2 (WARNING) -> 3.7 (CRITICAL)
      const targetPhByStep = [6.7, 6.1, 5.2, 4.3, 3.6, 3.4];
      const target = targetPhByStep[Math.min(step, targetPhByStep.length - 1)];
      this.current.ph += (target - this.current.ph) * 0.75 + (Math.random() * 0.08 - 0.04);
    } else if (type === 'turbidity') {
      // Controlled sedimentation surge: 0.7 -> 1.5 (WARNING) -> 3.2 (WARNING) -> 5.8 (CRITICAL)
      const targetTurbByStep = [1.5, 2.8, 4.2, 5.8, 6.5, 7.2];
      const target = targetTurbByStep[Math.min(step, targetTurbByStep.length - 1)];
      this.current.turbidity += (target - this.current.turbidity) * 0.75 + (Math.random() * 0.1 - 0.05);
    }
  }

  /**
   * Generates a pre-populated history of N realistic consecutive readings
   * leading up to the current time, with gradual drift.
   */
  generateInitialHistory(count = 15, intervalSeconds = 3) {
    const readings = [];
    let state = { ...BASELINE };
    const now = Date.now();

    for (let i = count - 1; i >= 0; i--) {
      // Small drift
      state.tds += (Math.random() - 0.5) * 3 + (BASELINE.tds - state.tds) * 0.1;
      state.ph += (Math.random() - 0.5) * 0.04 + (BASELINE.ph - state.ph) * 0.1;
      state.turbidity += (Math.random() - 0.5) * 0.04 + (BASELINE.turbidity - state.turbidity) * 0.1;
      state.temp += (Math.random() - 0.5) * 0.08 + (BASELINE.temp - state.temp) * 0.1;

      const timestamp = new Date(now - i * intervalSeconds * 1000).toISOString();
      const roundedTds = Math.round(state.tds);
      const roundedPh = Number(state.ph.toFixed(2));
      const roundedTurb = Number(state.turbidity.toFixed(2));
      const roundedTemp = Number(state.temp.toFixed(1));

      const evalResult = evaluateReading({
        tds: roundedTds,
        ph: roundedPh,
        turbidity: roundedTurb,
        temp: roundedTemp,
      });

      readings.push({
        id: `sim-hist-${i}`,
        device_id: 'ESP32-NODE-01 (SIMULATED)',
        tds: roundedTds,
        ph: roundedPh,
        turbidity: roundedTurb,
        temp: roundedTemp,
        status: evalResult.overallStatus,
        is_simulated: true,
        recorded_at: timestamp,
      });
    }

    return readings;
  }
}

export const simulationEngine = new SimulationEngine();
