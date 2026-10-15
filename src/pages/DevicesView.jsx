import React from 'react';
import { 
  Cpu, 
  Radio, 
  Wifi, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Code, 
  Terminal,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function DevicesView() {
  const { latestReading, deviceStatus, isSimulated } = useData();

  const sensorPins = [
    { name: 'Analog TDS Sensor', pin: 'GPIO 34 (ADC1_CH6)', interface: 'Analog 0–3.3V', calib: 'K-Factor = 0.5' },
    { name: 'Analog pH Sensor Probe', pin: 'GPIO 35 (ADC1_CH7)', interface: 'Analog 0–3.3V', calib: 'Neutral 2.5V = 7.0 pH' },
    { name: 'Turbidity Optical Sensor', pin: 'GPIO 32 (ADC1_CH4)', interface: 'Analog 0–3.3V', calib: 'Clear Water = 4.1V' },
    { name: 'DS18B20 Waterproof Temp', pin: 'GPIO 4 (Digital)', interface: '1-Wire Bus', calib: 'Digital Celsius ±0.5°C' },
  ];

  return (
    <div>
      {/* Node Hardware Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="card-title-group">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Cpu size={22} />
            </div>
            <div>
              <h3 className="card-title">ESP32 IoT Telemetry Node Registry</h3>
              <p className="card-subtitle">
                Hardware node provisioning and sensor pinout specifications
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="status-pill device-online">
              <span className="pulse-dot"></span>
              <span>Node: {latestReading?.device_id || 'ESP32-NODE-01'}</span>
            </span>
            <span className="status-pill simulated">
              <span>{isSimulated ? 'Simulated Telemetry' : 'Physical Hardware'}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Microcontroller</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>ESP32-WROOM-32D</div>
          </div>
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Wi-Fi Protocol</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>800.11 b/g/n (2.4 GHz)</div>
          </div>
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Ingestion Gateway</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>Python FastAPI + Supabase</div>
          </div>
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Sampling Cycle</span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>3 Seconds (Simulated)</div>
          </div>
        </div>
      </div>

      {/* Sensor Pinout Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Layers size={18} color="#0d9488" />
            <h3 className="card-title">Sensor Hardware Interface &amp; Pin Mapping</h3>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Sensor Module</th>
                <th>ESP32 GPIO Pin</th>
                <th>Interface Type</th>
                <th>Calibration Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sensorPins.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><code>{s.pin}</code></td>
                  <td>{s.interface}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.calib}</td>
                  <td>
                    <span className="sensor-status-badge" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
                      Ready
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Future FastAPI Integration Architecture */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Server size={18} color="#0d9488" />
            <h3 className="card-title">Future Backend &amp; ESP32 Hardware Integration Pipeline</h3>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '0.85rem' }}>
            When connecting physical ESP32 hardware, the architecture routes telemetry through a Python FastAPI intermediary backend, shielding your Supabase credentials:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            overflowX: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem'
          }}>
            <div style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontWeight: 700, color: 'var(--teal-900)' }}>ESP32 Node</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>4 Water Probes</div>
            </div>
            <ArrowRight size={18} color="#94a3b8" />
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontWeight: 700, color: 'var(--teal-900)' }}>FastAPI Gateway</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>POST /api/telemetry</div>
            </div>
            <ArrowRight size={18} color="#94a3b8" />
            <div style={{ textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontWeight: 700, color: 'var(--teal-900)' }}>Supabase Postgres</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>public.readings</div>
            </div>
            <ArrowRight size={18} color="#94a3b8" />
            <div style={{ textAlign: 'center', minWidth: '140px' }}>
              <div style={{ fontWeight: 700, color: 'var(--teal-900)' }}>React Dashboard</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Realtime Stream</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="#0d9488" />
            <span>Frontend service modules isolate data-access logic cleanly, ensuring seamless transition between mock and physical telemetry.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
