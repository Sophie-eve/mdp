import React from 'react';
import { 
  Activity, 
  RefreshCw, 
  Radio, 
  Cpu, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  Flame,
  Droplet,
  FlaskConical
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { checkTds, checkPh, checkTurbidity, checkTemp, getStatusTheme } from '../utils/thresholds';

export default function LiveMonitoringView() {
  const { 
    latestReading, 
    readings, 
    refreshDatabase, 
    loading, 
    deviceStatus, 
    isSimulated, 
    dataSourceMode, 
    setDataSourceMode,
    simulationSpeedSec,
    setSimulationSpeedSec,
    isSimPaused,
    setIsSimPaused,
    triggerContamination,
    resetDemo,
    activeContamination,
    isStale
  } = useData();

  const tdsEval = latestReading ? checkTds(latestReading.tds) : { status: 'SENSOR ERROR', message: 'N/A' };
  const phEval = latestReading ? checkPh(latestReading.ph) : { status: 'SENSOR ERROR', message: 'N/A' };
  const turbEval = latestReading ? checkTurbidity(latestReading.turbidity) : { status: 'SENSOR ERROR', message: 'N/A' };
  const tempEval = latestReading ? checkTemp(latestReading.temp) : { status: 'SENSOR ERROR', message: 'N/A' };

  const formatTime = (ts) => ts ? new Date(ts).toLocaleTimeString() : 'N/A';

  const gaugeMetrics = [
    {
      name: 'TDS (Total Dissolved Solids)',
      value: latestReading?.tds ?? '--',
      unit: 'ppm',
      min: 0,
      max: 2500,
      current: latestReading?.tds || 0,
      eval: tdsEval,
      warningThreshold: 500,
      criticalThreshold: 2000,
      color: '#0d9488',
    },
    {
      name: 'pH Level',
      value: latestReading?.ph !== undefined ? Number(latestReading.ph).toFixed(2) : '--',
      unit: '',
      min: 0,
      max: 14,
      current: latestReading?.ph || 7,
      eval: phEval,
      warningRange: [6.5, 8.5],
      color: '#3b82f6',
    },
    {
      name: 'Turbidity (Clarity)',
      value: latestReading?.turbidity !== undefined ? Number(latestReading.turbidity).toFixed(2) : '--',
      unit: 'NTU',
      min: 0,
      max: 10,
      current: latestReading?.turbidity || 0,
      eval: turbEval,
      warningThreshold: 1.0,
      criticalThreshold: 5.0,
      color: '#8b5cf6',
    },
    {
      name: 'Water Temperature',
      value: latestReading?.temp !== undefined ? Number(latestReading.temp).toFixed(1) : '--',
      unit: '°C',
      min: 0,
      max: 50,
      current: latestReading?.temp || 20,
      eval: tempEval,
      warningRange: [10, 35],
      color: '#f59e0b',
    },
  ];

  return (
    <div>
      {/* Contamination Demo Alert Banner (when active) */}
      {activeContamination && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertOctagon size={24} color="#dc2626" />
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.95rem' }}>
                Active Presentation Contamination Sequence: {activeContamination.toUpperCase()}
              </strong>
              <p style={{ color: '#b91c1c', fontSize: '0.82rem', margin: 0 }}>
                Sensor values are deliberately ascending in a controlled sequence to demonstrate alert triggers.
              </p>
            </div>
          </div>

          <button 
            onClick={resetDemo}
            className="btn-primary btn-sm"
            style={{ backgroundColor: '#059669', borderColor: '#059669' }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo to Safe Baseline</span>
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Activity size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Live Telemetry Console</h3>
                <span className={`status-pill ${dataSourceMode === 'SIMULATION' ? 'simulated' : 'connected'}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  {dataSourceMode === 'SIMULATION' ? 'SIMULATED DEMO MODE' : 'SUPABASE DATABASE MODE'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {dataSourceMode === 'SIMULATION' 
                  ? 'Deterministic gradual drift without abrupt jumps • Demo presentation controls enabled'
                  : 'Displaying verified records from Supabase public.readings'}
              </p>
            </div>
          </div>

          {/* Operational Mode & Simulation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Mode Switcher */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setDataSourceMode('SIMULATION')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: dataSourceMode === 'SIMULATION' ? 700 : 500,
                  backgroundColor: dataSourceMode === 'SIMULATION' ? '#ffffff' : 'transparent',
                  color: dataSourceMode === 'SIMULATION' ? 'var(--teal-900)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: dataSourceMode === 'SIMULATION' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Demo Simulation
              </button>
              <button
                onClick={() => setDataSourceMode('DATABASE')}
                style={{
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.78rem',
                  fontWeight: dataSourceMode === 'DATABASE' ? 700 : 500,
                  backgroundColor: dataSourceMode === 'DATABASE' ? '#ffffff' : 'transparent',
                  color: dataSourceMode === 'DATABASE' ? 'var(--teal-900)' : 'var(--text-muted)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: dataSourceMode === 'DATABASE' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Supabase DB
              </button>
            </div>

            {/* Simulation Speed & Pause controls */}
            {dataSourceMode === 'SIMULATION' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsSimPaused(!isSimPaused)}
                  className="btn-secondary btn-sm"
                  title={isSimPaused ? 'Resume live simulation' : 'Pause simulation'}
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  {isSimPaused ? <Play size={13} color="#059669" /> : <Pause size={13} />}
                  <span style={{ fontSize: '0.75rem' }}>{isSimPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <select
                  value={simulationSpeedSec}
                  onChange={(e) => setSimulationSpeedSec(Number(e.target.value))}
                  style={{
                    padding: '0.35rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    fontSize: '0.75rem'
                  }}
                >
                  <option value={2}>Speed: 2s</option>
                  <option value={3}>Speed: 3s</option>
                  <option value={5}>Speed: 5s</option>
                </select>
              </div>
            )}

            {dataSourceMode === 'DATABASE' && (
              <button 
                onClick={refreshDatabase}
                disabled={loading}
                className="btn-secondary btn-sm"
              >
                <RefreshCw size={13} className={loading ? 'pulse-dot' : ''} />
                <span>Re-query Supabase</span>
              </button>
            )}
          </div>
        </div>

        {/* Presentation Contamination Trigger Bar */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            🧪 Presentation Contamination Demos:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => triggerContamination('tds')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', fontWeight: 600 }}
            >
              <Flame size={12} color="#dc2626" />
              <span>Simulate High TDS Spike (&gt; 2000 ppm) (+ SMS)</span>
            </button>

            <button
              onClick={() => triggerContamination('ph')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', fontWeight: 600 }}
            >
              <FlaskConical size={12} color="#f59e0b" />
              <span>Simulate Acid Spill (pH &lt; 4.0) (+ SMS)</span>
            </button>

            <button
              onClick={() => triggerContamination('turbidity')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', fontWeight: 600 }}
            >
              <Droplet size={12} color="#8b5cf6" />
              <span>Simulate Turbidity Spike (&gt; 5.0 NTU) (+ SMS)</span>
            </button>

            <button
              onClick={resetDemo}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', color: '#047857' }}
            >
              <RotateCcw size={12} />
              <span>Reset to Safe Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sensor gauges grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {gaugeMetrics.map((g, idx) => {
          const theme = getStatusTheme(g.eval.status);
          const pct = Math.min(100, Math.max(0, ((g.current - g.min) / (g.max - g.min)) * 100));

          return (
            <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {g.name}
                </span>
                <span 
                  className="sensor-status-badge"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                    fontSize: '0.72rem'
                  }}
                >
                  {g.eval.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                  {g.value}
                </span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {g.unit}
                </span>
              </div>

              {/* Progress bar gauge */}
              <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: theme.solid,
                    borderRadius: '999px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.35rem' }}>
                  <span>{g.min} {g.unit}</span>
                  <span>{g.max} {g.unit}</span>
                </div>
              </div>

              <div style={{
                marginTop: 'auto',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-light)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {g.eval.message}
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Hardware Overview Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Cpu size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Telemetry Telecommunications Status</h3>
              <p className="card-subtitle">Node controller specifications and packet stream state</p>
            </div>
          </div>
          <span className={`status-pill ${isStale ? 'unconfigured' : 'device-online'}`}>
            <Radio size={12} />
            <span>{isStale ? 'Stale Data (>15m)' : deviceStatus}</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Stream Source</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {dataSourceMode === 'SIMULATION' ? 'Deterministic Simulator' : 'Supabase public.readings'}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Hardware Mode</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} color="#2563eb" />
              <span>{isSimulated ? 'Simulated Telemetry' : 'Physical ESP32 Node'}</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Latest Packet Timestamp</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {formatTime(latestReading?.recorded_at)}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Physical ESP32 Readiness</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} />
              <span>FastAPI Gateway Standby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
