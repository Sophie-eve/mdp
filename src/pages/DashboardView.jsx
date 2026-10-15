import React from 'react';
import { 
  Flame, 
  RotateCcw, 
  Sparkles, 
  Radio, 
  AlertOctagon, 
  Database,
  FlaskConical,
  Droplet
} from 'lucide-react';
import OverallStatusBanner from '../components/dashboard/OverallStatusBanner';
import SensorCard from '../components/dashboard/SensorCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import SensorCharts from '../components/dashboard/SensorCharts';
import RecentReadingsTable from '../components/dashboard/RecentReadingsTable';
import ConfigNotice from '../components/common/ConfigNotice';
import { useData } from '../context/DataContext';
import { checkTds, checkPh, checkTurbidity, checkTemp, THRESHOLDS } from '../utils/thresholds';

export default function DashboardView({ onNavigate }) {
  const { 
    latestReading, 
    evaluation, 
    overallStatus, 
    readings, 
    loading, 
    error, 
    isSimulated,
    isStale,
    dataSourceMode,
    setDataSourceMode,
    activeContamination,
    triggerContamination,
    resetDemo
  } = useData();

  // Evaluate each parameter status
  const tdsEval = latestReading ? checkTds(latestReading.tds) : { status: 'SENSOR ERROR', message: 'No data' };
  const phEval = latestReading ? checkPh(latestReading.ph) : { status: 'SENSOR ERROR', message: 'No data' };
  const turbEval = latestReading ? checkTurbidity(latestReading.turbidity) : { status: 'SENSOR ERROR', message: 'No data' };
  const tempEval = latestReading ? checkTemp(latestReading.temp) : { status: 'SENSOR ERROR', message: 'No data' };

  return (
    <div>
      <ConfigNotice />

      {/* Active Presentation Contamination Banner */}
      {activeContamination && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.5rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 8px 24px -4px rgba(220, 38, 38, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertOctagon size={26} color="#dc2626" className="pulse-dot" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong style={{ color: '#991b1b', fontSize: '0.98rem' }}>
                  CRITICAL SPIKE TRIGGERED: {activeContamination.toUpperCase()} HAZARD
                </strong>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  📱 Cellular SMS Dispatched
                </span>
              </div>
              <p style={{ color: '#b91c1c', fontSize: '0.83rem', margin: '0.2rem 0 0 0' }}>
                Water quality threshold breached! An automated emergency SMS notification has been dispatched to the configured mobile phone.
              </p>
            </div>
          </div>

          <button 
            onClick={resetDemo}
            className="btn-primary btn-sm"
            style={{ backgroundColor: '#059669', borderColor: '#059669', fontWeight: 700 }}
          >
            <RotateCcw size={14} />
            <span>Reset to Safe Baseline</span>
          </button>
        </div>
      )}

      {/* Presentation Demo Bar & Mode Selector */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Data Mode:
            </span>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setDataSourceMode('SIMULATION')}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.76rem',
                  fontWeight: dataSourceMode === 'SIMULATION' ? 700 : 500,
                  backgroundColor: dataSourceMode === 'SIMULATION' ? '#ffffff' : 'transparent',
                  color: dataSourceMode === 'SIMULATION' ? 'var(--teal-900)' : 'var(--text-muted)',
                  borderRadius: '4px',
                  boxShadow: dataSourceMode === 'SIMULATION' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Demo Simulation
              </button>
              <button
                onClick={() => setDataSourceMode('DATABASE')}
                style={{
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.76rem',
                  fontWeight: dataSourceMode === 'DATABASE' ? 700 : 500,
                  backgroundColor: dataSourceMode === 'DATABASE' ? '#ffffff' : 'transparent',
                  color: dataSourceMode === 'DATABASE' ? 'var(--teal-900)' : 'var(--text-muted)',
                  borderRadius: '4px',
                  boxShadow: dataSourceMode === 'DATABASE' ? 'var(--shadow-sm)' : 'none',
                }}
              >
                Supabase DB
              </button>
            </div>
          </div>

          {/* Quick presentation trigger buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Simulate Contamination:
            </span>
            <button
              onClick={() => triggerContamination('tds')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', fontWeight: 600 }}
              title="Instantly elevates TDS above 2000 ppm and dispatches emergency SMS"
            >
              <Flame size={12} color="#dc2626" />
              <span>TDS Spike (+SMS)</span>
            </button>
            <button
              onClick={() => triggerContamination('ph')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', fontWeight: 600 }}
              title="Instantly drops pH below 4.0 and dispatches emergency SMS"
            >
              <FlaskConical size={12} color="#f59e0b" />
              <span>Acid Spill (+SMS)</span>
            </button>
            <button
              onClick={() => triggerContamination('turbidity')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', fontWeight: 600 }}
              title="Instantly surges turbidity above 5.0 NTU and dispatches emergency SMS"
            >
              <Droplet size={12} color="#8b5cf6" />
              <span>Turbidity Spike (+SMS)</span>
            </button>
            <button
              onClick={resetDemo}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', color: '#047857' }}
              title="Restores safe normal baseline"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-message error" style={{ marginBottom: '1.5rem' }}>
          <span>{error}</span>
        </div>
      )}

      {/* Overall Water Quality Status Banner */}
      <OverallStatusBanner
        status={overallStatus}
        evaluation={evaluation}
        deviceId={latestReading?.device_id}
        recordedAt={latestReading?.recorded_at}
        isSimulated={isSimulated}
        isStale={isStale}
        dataSourceMode={dataSourceMode}
      />

      {/* 4 Sensor Cards */}
      <div className="sensor-cards-grid">
        <SensorCard
          type="tds"
          name="TDS Level"
          value={latestReading?.tds}
          unit="ppm"
          status={tdsEval.status}
          timestamp={latestReading?.recorded_at}
          thresholdNote="Warning > 500 ppm • Critical > 2000 ppm"
          description={THRESHOLDS.tds.description}
        />

        <SensorCard
          type="ph"
          name="pH Level"
          value={latestReading?.ph}
          unit=""
          status={phEval.status}
          timestamp={latestReading?.recorded_at}
          thresholdNote="Acceptable range: 6.5 – 8.5"
          description={THRESHOLDS.ph.description}
        />

        <SensorCard
          type="turbidity"
          name="Turbidity"
          value={latestReading?.turbidity}
          unit="NTU"
          status={turbEval.status}
          timestamp={latestReading?.recorded_at}
          thresholdNote="Warning > 1.0 NTU • Critical > 5.0 NTU"
          description={THRESHOLDS.turbidity.description}
        />

        <SensorCard
          type="temp"
          name="Water Temp"
          value={latestReading?.temp}
          unit="°C"
          status={tempEval.status}
          timestamp={latestReading?.recorded_at}
          thresholdNote="Acceptable range: 10°C – 35°C"
          description={THRESHOLDS.temp.description}
        />
      </div>

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Historical Telemetry Charts */}
      <SensorCharts readings={readings} />

      {/* Recent Readings Database Table */}
      <RecentReadingsTable
        readings={readings}
        maxRows={8}
        onViewAll={() => onNavigate?.('history')}
      />
    </div>
  );
}
