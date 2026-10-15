import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets,
  Gauge
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useData } from '../context/DataContext';

export default function AnalyticsView() {
  const { readings } = useData();

  if (readings.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>No data available for analytical computation.</p>
      </div>
    );
  }

  // Calculate statistics
  const tdsValues = readings.map(r => Number(r.tds)).filter(v => !isNaN(v));
  const phValues = readings.map(r => Number(r.ph)).filter(v => !isNaN(v));
  const turbValues = readings.map(r => Number(r.turbidity)).filter(v => !isNaN(v));
  const tempValues = readings.map(r => Number(r.temp)).filter(v => !isNaN(v));

  const avg = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const min = (arr) => arr.length ? Math.min(...arr) : 0;
  const max = (arr) => arr.length ? Math.max(...arr) : 0;

  const stats = [
    { name: 'TDS (ppm)', avg: avg(tdsValues).toFixed(0), min: min(tdsValues), max: max(tdsValues), unit: 'ppm', target: '< 500 ppm' },
    { name: 'pH Level', avg: avg(phValues).toFixed(2), min: min(phValues).toFixed(2), max: max(phValues).toFixed(2), unit: '', target: '6.5 – 8.5' },
    { name: 'Turbidity', avg: avg(turbValues).toFixed(2), min: min(turbValues).toFixed(2), max: max(turbValues).toFixed(2), unit: 'NTU', target: '< 1.0 NTU' },
    { name: 'Temperature', avg: avg(tempValues).toFixed(1), min: min(tempValues).toFixed(1), max: max(tempValues).toFixed(1), unit: '°C', target: '10 – 35 °C' },
  ];

  // Status breakdown
  const safeCount = readings.filter(r => (r.status || '').toUpperCase() === 'SAFE').length;
  const warningCount = readings.filter(r => (r.status || '').toUpperCase() === 'WARNING').length;
  const criticalCount = readings.filter(r => ['CRITICAL', 'UNSAFE'].includes((r.status || '').toUpperCase())).length;

  const pieData = [
    { name: 'SAFE', value: safeCount, color: '#10b981' },
    { name: 'WARNING', value: warningCount, color: '#f59e0b' },
    { name: 'CRITICAL', value: criticalCount, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Parameter comparison chart
  const comparisonData = readings.map((r, i) => ({
    name: `R#${i + 1}`,
    tds: r.tds,
    ph: Number((r.ph * 50).toFixed(0)), // scaled for visibility alongside TDS if needed or separate
    turbidity: Number((r.turbidity * 50).toFixed(0)),
    temp: r.temp,
  }));

  // WQI calculation approximation
  const complianceRate = Math.round((safeCount / readings.length) * 100);

  return (
    <div>
      {/* Top metrics summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {stats.map((s, idx) => (
          <div key={idx} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {s.name}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.35rem 0' }}>
              {s.avg} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.unit}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
              <span>Min: <strong>{s.min}</strong></span>
              <span>Max: <strong>{s.max}</strong></span>
              <span>Target: <strong>{s.target}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytical charts grid */}
      <div className="charts-grid">
        {/* Compliance Distribution Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <BarChart3 size={20} color="#0d9488" />
              <div>
                <h3 className="card-title">TDS Level Distribution per Record</h3>
                <p className="card-subtitle">Measured dissolved solid concentrations across the dataset</p>
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readings.map((r, i) => ({ id: `R${i + 1}`, tds: r.tds, status: r.status }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="id" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#0d9488" fontSize={12} unit=" ppm" />
                <Tooltip />
                <Bar dataKey="tds" fill="#0d9488" radius={[4, 4, 0, 0]} name="TDS (ppm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Distribution Pie */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <Award size={20} color="#0d9488" />
              <div>
                <h3 className="card-title">Overall Quality Ratio</h3>
                <p className="card-subtitle">Safety classification across recorded telemetry</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              {pieData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                  <span style={{ fontWeight: 600 }}>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Compliance Rate: <strong style={{ color: '#0d9488', fontSize: '1.1rem' }}>{complianceRate}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
