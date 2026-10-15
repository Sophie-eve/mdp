import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Database,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { getStatusTheme } from '../utils/thresholds';

export default function ReadingHistoryView() {
  const { readings, loading, refreshDatabase, dataSourceMode } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first

  // Filter readings
  const filtered = readings.filter((r) => {
    const matchesSearch = 
      (r.device_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.recorded_at || '').includes(searchTerm);

    const matchesStatus = 
      statusFilter === 'ALL' || 
      (r.status || '').toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort with id tie-breaker to prevent order flips
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.recorded_at).getTime();
    const timeB = new Date(b.recorded_at).getTime();
    if (timeA !== timeB) {
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    }
    const idA = String(a.id ?? '');
    const idB = String(b.id ?? '');
    return sortOrder === 'desc'
      ? idB.localeCompare(idA, undefined, { numeric: true })
      : idA.localeCompare(idB, undefined, { numeric: true });
  });

  const exportCsv = () => {
    if (sorted.length === 0) return;
    const headers = ['ID', 'Device ID', 'TDS (ppm)', 'pH', 'Turbidity (NTU)', 'Temp (C)', 'Status', 'Simulated', 'Recorded At'];
    const rows = sorted.map(r => [
      r.id,
      r.device_id,
      r.tds,
      r.ph,
      r.turbidity,
      r.temp,
      r.status,
      r.is_simulated ? 'Yes' : 'No',
      r.recorded_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aquasense_readings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleString();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="card-title-group">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <History size={20} />
            </div>
            <div>
              <h3 className="card-title">Database Reading History</h3>
              <p className="card-subtitle">
                Complete query log from <code>public.readings</code> table ({sorted.length} records)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button 
              onClick={refreshDatabase}
              className="btn-secondary btn-sm"
              disabled={loading}
              title="Refresh from Supabase"
            >
              <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
              <span>Refresh</span>
            </button>
            <button 
              onClick={exportCsv} 
              className="btn-secondary btn-sm"
              disabled={sorted.length === 0}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by device, status or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#ffffff',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SAFE">SAFE</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="btn-secondary btn-sm"
            style={{ padding: '0.65rem 0.85rem' }}
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Device Node</th>
                <th>TDS (ppm)</th>
                <th>pH</th>
                <th>Turbidity (NTU)</th>
                <th>Temp (°C)</th>
                <th>Status (DB)</th>
                <th>Source</th>
                <th>Recorded At</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No readings match the current filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((r) => {
                  const theme = getStatusTheme(r.status);
                  return (
                    <tr key={r.id || `${r.recorded_at}-${r.device_id}`}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {r.id || 'N/A'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.78rem',
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          {r.device_id}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {r.tds !== null ? r.tds : '--'}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {r.ph !== null ? Number(r.ph).toFixed(2) : '--'}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {r.turbidity !== null ? Number(r.turbidity).toFixed(2) : '--'}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {r.temp !== null ? `${Number(r.temp).toFixed(1)}°` : '--'}
                      </td>
                      <td>
                        <span
                          className="sensor-status-badge"
                          style={{
                            backgroundColor: theme.bg,
                            color: theme.text,
                            borderColor: theme.border,
                            fontSize: '0.72rem',
                          }}
                        >
                          {r.status || 'SAFE'}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                          backgroundColor: r.is_simulated ? '#eff6ff' : '#ecfdf5',
                          color: r.is_simulated ? '#1d4ed8' : '#047857',
                        }}>
                          {r.is_simulated ? <Sparkles size={11} /> : <CheckCircle2 size={11} />}
                          {r.is_simulated ? 'Simulated' : 'Hardware'}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={12} color="#94a3b8" />
                          <span>{formatTimestamp(r.recorded_at)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
