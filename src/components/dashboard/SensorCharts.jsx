import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, LayoutGrid, Layers, Filter } from 'lucide-react';

export default function SensorCharts({ readings = [] }) {
  const [chartMode, setChartMode] = useState('grid'); // 'grid' (separate 4 charts) or 'tabs' (single focused tab)
  const [activeMetric, setActiveMetric] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30'); // '15', '30', 'all'

  // Apply time window filter
  const filteredReadings = useMemo(() => {
    if (timeFilter === 'all') return readings;
    const count = parseInt(timeFilter, 10);
    return readings.slice(-count);
  }, [readings, timeFilter]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return filteredReadings.map((r, index) => {
      const dateObj = new Date(r.recorded_at);
      const timeLabel = !isNaN(dateObj) 
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : `#${index + 1}`;
      
      const fullDate = !isNaN(dateObj) ? dateObj.toLocaleString() : 'N/A';

      return {
        id: r.id,
        index: index + 1,
        time: timeLabel,
        fullDate,
        tds: r.tds !== null ? Number(r.tds) : null,
        ph: r.ph !== null ? Number(r.ph) : null,
        turbidity: r.turbidity !== null ? Number(r.turbidity) : null,
        temp: r.temp !== null ? Number(r.temp) : null,
        status: r.status,
        isSimulated: r.is_simulated,
      };
    });
  }, [filteredReadings]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.65rem 0.85rem',
          boxShadow: 'var(--shadow-dropdown)',
          fontSize: '0.8rem',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
            {data.time} ({data.fullDate})
          </div>
          {payload.map((entry, idx) => (
            <div key={`item-${idx}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', color: entry.color, margin: '0.15rem 0' }}>
              <span style={{ fontWeight: 600 }}>{entry.name}:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {entry.value !== null ? entry.value : '--'} {entry.unit}
              </span>
            </div>
          ))}
          <div style={{ marginTop: '0.35rem', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            <span>Status: <strong>{data.status}</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Chart Control Bar */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="card-title-group">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="card-title">Real-Time Sensor Telemetry Trends</h3>
              <p className="card-subtitle">
                Displaying {chartData.length} data points with project safety threshold bounds
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Time Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Filter size={13} color="var(--text-muted)" />
              <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
                {[
                  { id: '15', label: 'Last 15' },
                  { id: '30', label: 'Last 30' },
                  { id: 'all', label: 'All History' },
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id)}
                    style={{
                      padding: '0.25rem 0.55rem',
                      fontSize: '0.75rem',
                      fontWeight: timeFilter === tf.id ? 700 : 500,
                      backgroundColor: timeFilter === tf.id ? '#ffffff' : 'transparent',
                      color: timeFilter === tf.id ? 'var(--teal-900)' : 'var(--text-muted)',
                      borderRadius: '4px',
                      boxShadow: timeFilter === tf.id ? 'var(--shadow-sm)' : 'none',
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Mode Switcher */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
              <button
                onClick={() => setChartMode('grid')}
                className={`btn-secondary btn-sm ${chartMode === 'grid' ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: chartMode === 'grid' ? 700 : 500,
                  backgroundColor: chartMode === 'grid' ? '#ffffff' : 'transparent',
                  color: chartMode === 'grid' ? 'var(--teal-900)' : 'var(--text-muted)',
                }}
              >
                <LayoutGrid size={13} />
                <span>4 Separate Charts</span>
              </button>
              <button
                onClick={() => setChartMode('tabs')}
                className={`btn-secondary btn-sm ${chartMode === 'tabs' ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.75rem',
                  fontWeight: chartMode === 'tabs' ? 700 : 500,
                  backgroundColor: chartMode === 'tabs' ? '#ffffff' : 'transparent',
                  color: chartMode === 'tabs' ? 'var(--teal-900)' : 'var(--text-muted)',
                }}
              >
                <Layers size={13} />
                <span>Focused View</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="card" style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No telemetry readings available to render chart.
        </div>
      ) : chartMode === 'grid' ? (
        /* SEPARATE 4 LINE CHARTS GRID */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem' }}>
          {/* TDS Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0d9488' }}>Total Dissolved Solids (TDS)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unit: ppm • Warn &gt;500 • Crit &gt;2000</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {chartData[chartData.length - 1]?.tds ?? '--'} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>ppm</span>
              </span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tdsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#0d9488" fontSize={10} domain={[0, (dataMax) => Math.max(600, dataMax + 100)]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={500} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 500', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={2000} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crit 2000', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="tds" name="TDS" unit="ppm" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#tdsGrad)" dot={{ r: 3 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* pH Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#3b82f6' }}>pH Level (Acidity / Alkalinity)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Scale: 0–14 • Acceptable 6.5 – 8.5</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {chartData[chartData.length - 1]?.ph?.toFixed(2) ?? '--'}
              </span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#3b82f6" fontSize={10} domain={[5.0, 9.5]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={6.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Min 6.5', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={8.5} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Max 8.5', fill: '#f59e0b', fontSize: 10 }} />
                  <Area type="monotone" dataKey="ph" name="pH" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#phGrad)" dot={{ r: 3 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Turbidity Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#8b5cf6' }}>Turbidity (Water Clarity)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unit: NTU • Warn &gt;1.0 • Crit &gt;5.0</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {chartData[chartData.length - 1]?.turbidity?.toFixed(2) ?? '--'} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>NTU</span>
              </span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="turbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#8b5cf6" fontSize={10} domain={[0, (dataMax) => Math.max(2.0, dataMax + 0.5)]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={1.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warn 1.0', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={5.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Crit 5.0', fill: '#ef4444', fontSize: 10 }} />
                  <Area type="monotone" dataKey="turbidity" name="Turbidity" unit="NTU" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#turbGrad)" dot={{ r: 3 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#f59e0b' }}>Water Temperature</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unit: °C • Acceptable 10.0°C – 35.0°C</span>
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {chartData[chartData.length - 1]?.temp?.toFixed(1) ?? '--'} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>°C</span>
              </span>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#f59e0b" fontSize={10} domain={[15, 35]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={10.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Min 10°', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={35.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Max 35°', fill: '#f59e0b', fontSize: 10 }} />
                  <Area type="monotone" dataKey="temp" name="Temperature" unit="°C" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGrad)" dot={{ r: 3 }} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* SINGLE FOCUSED TAB VIEW */
        <div className="card">
          <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            {[
              { id: 'all', label: 'All Metrics Overlay' },
              { id: 'tds', label: 'TDS (ppm)' },
              { id: 'ph', label: 'pH Level' },
              { id: 'turbidity', label: 'Turbidity (NTU)' },
              { id: 'temp', label: 'Temperature (°C)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMetric(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: activeMetric === tab.id ? 700 : 500,
                  backgroundColor: activeMetric === tab.id ? '#ffffff' : 'transparent',
                  color: activeMetric === tab.id ? 'var(--teal-900)' : 'var(--text-muted)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#0d9488" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line yAxisId="left" type="monotone" dataKey="tds" name="TDS" unit="ppm" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="turbidity" name="Turbidity" unit="NTU" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
                <Line yAxisId="right" type="monotone" dataKey="temp" name="Temperature" unit="°C" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
