import React from 'react';
import { Clock, Database, Sparkles, AlertCircle, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import { getStatusTheme } from '../../utils/thresholds';

export default function RecentReadingsTable({ readings = [], maxRows = 8, onViewAll }) {
  // Sort by recorded_at descending (newest first) with id tie-breaker
  const sorted = [...readings].sort((a, b) => {
    const timeA = new Date(a.recorded_at).getTime();
    const timeB = new Date(b.recorded_at).getTime();
    if (timeA !== timeB) return timeB - timeA;
    const idA = String(a.id ?? '');
    const idB = String(b.id ?? '');
    return idB.localeCompare(idA, undefined, { numeric: true });
  });
  const displayed = sorted.slice(0, maxRows);

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    if (isNaN(d)) return ts;
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="card-header">
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
            <Database size={18} />
          </div>
          <div>
            <h3 className="card-title">Recent Database Telemetry</h3>
            <p className="card-subtitle">
              {readings.length} readings fetched from Supabase <code>public.readings</code>
            </p>
          </div>
        </div>

        {onViewAll && readings.length > maxRows && (
          <button onClick={onViewAll} className="btn-secondary btn-sm">
            View All ({readings.length})
          </button>
        )}
      </div>

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Timestamp (DB)</th>
              <th>Device</th>
              <th>TDS (ppm)</th>
              <th>pH</th>
              <th>Turbidity (NTU)</th>
              <th>Temp (°C)</th>
              <th>Status</th>
              <th>Source Type</th>
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No sensor records found in database.
                </td>
              </tr>
            ) : (
              displayed.map((row) => {
                const theme = getStatusTheme(row.status);
                const isSimulated = Boolean(row.is_simulated);

                return (
                  <tr key={row.id || `${row.recorded_at}-${row.device_id}`}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} color="#94a3b8" />
                        <span>{formatTimestamp(row.recorded_at)}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {row.device_id || 'ESP32-NODE-01'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {row.tds !== null && row.tds !== undefined ? row.tds : '--'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {row.ph !== null && row.ph !== undefined ? Number(row.ph).toFixed(2) : '--'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {row.turbidity !== null && row.turbidity !== undefined ? Number(row.turbidity).toFixed(2) : '--'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {row.temp !== null && row.temp !== undefined ? `${Number(row.temp).toFixed(1)}°` : '--'}
                    </td>
                    <td>
                      <span 
                        className="sensor-status-badge"
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: theme.border,
                          fontSize: '0.72rem',
                          padding: '0.2rem 0.5rem'
                        }}
                      >
                        {row.status || 'SAFE'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.73rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '999px',
                        backgroundColor: isSimulated ? '#eff6ff' : '#ecfdf5',
                        color: isSimulated ? '#1d4ed8' : '#047857',
                        border: `1px solid ${isSimulated ? '#bfdbfe' : '#a7f3d0'}`
                      }}>
                        {isSimulated ? <Sparkles size={11} /> : <CheckCircle2 size={11} />}
                        {isSimulated ? 'Simulated' : 'Hardware'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
