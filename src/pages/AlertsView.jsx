import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  CheckCheck, 
  ShieldAlert, 
  Clock, 
  Filter, 
  Radio, 
  Sparkles,
  RotateCcw,
  BellOff,
  Flame,
  FlaskConical,
  Droplet
} from 'lucide-react';
import { useData } from '../context/DataContext';

export default function AlertsView() {
  const { 
    alerts, 
    acknowledgeAlert, 
    acknowledgeAllAlerts, 
    unacknowledgedAlertsCount,
    triggerContamination,
    resetDemo,
    activeContamination
  } = useData();

  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RECOVERED'

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'ACTIVE') return !a.recovered && !a.acknowledged;
    if (filter === 'ACKNOWLEDGED') return a.acknowledged;
    if (filter === 'RECOVERED') return a.recovered;
    return true;
  });

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div>

      {/* Presentation Contamination Controls */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>Demonstration Controls:</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Trigger deliberate threshold breaches to verify alarm and recovery mechanics
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => triggerContamination('tds')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              <Flame size={12} color="#dc2626" />
              <span>Trigger High TDS (&gt;2000) (+ SMS)</span>
            </button>
            <button
              onClick={() => triggerContamination('ph')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              <FlaskConical size={12} color="#f59e0b" />
              <span>Trigger Acid Spill (+ SMS)</span>
            </button>
            <button
              onClick={() => triggerContamination('turbidity')}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              <Droplet size={12} color="#8b5cf6" />
              <span>Trigger Turbidity Spike (+ SMS)</span>
            </button>
            <button
              onClick={resetDemo}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', color: '#047857' }}
            >
              <RotateCcw size={12} />
              <span>Reset &amp; Recover</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="card-title-group">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: unacknowledgedAlertsCount > 0 ? '#fef2f2' : 'var(--teal-50)',
              color: unacknowledgedAlertsCount > 0 ? '#ef4444' : 'var(--teal-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="card-title">Threshold Incidents &amp; Alerts Log</h3>
              <p className="card-subtitle">
                {unacknowledgedAlertsCount} active unacknowledged • {alerts.length} total logged incidents
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              {[
                { id: 'ALL', label: `All (${alerts.length})` },
                { id: 'ACTIVE', label: `Active (${unacknowledgedAlertsCount})` },
                { id: 'RECOVERED', label: 'Recovered' },
                { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.76rem',
                    fontWeight: filter === btn.id ? 700 : 500,
                    backgroundColor: filter === btn.id ? '#ffffff' : 'transparent',
                    color: filter === btn.id ? 'var(--teal-900)' : 'var(--text-muted)',
                    boxShadow: filter === btn.id ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {unacknowledgedAlertsCount > 0 && (
              <button
                onClick={acknowledgeAllAlerts}
                className="btn-secondary btn-sm"
              >
                <CheckCheck size={14} />
                <span>Acknowledge All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="alert-feed">
        {filteredAlerts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>No Incidents for Current Filter</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              All monitored water quality parameters are either normal or marked as resolved.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alt) => {
            const isCritical = alt.severity === 'CRITICAL';
            const Icon = isCritical ? AlertOctagon : AlertTriangle;

            return (
              <div 
                key={alt.id} 
                className={`alert-item ${isCritical ? 'critical' : 'warning'} ${alt.acknowledged ? 'acknowledged' : ''}`}
                style={{
                  borderLeftColor: alt.recovered ? '#10b981' : undefined,
                  backgroundColor: alt.recovered ? '#f8fafc' : undefined
                }}
              >
                <div className="alert-left">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: alt.recovered ? 'rgba(16, 185, 129, 0.12)' : isCritical ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: alt.recovered ? '#10b981' : isCritical ? '#ef4444' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {alt.recovered ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </div>

                  <div className="alert-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <h4>{alt.parameter}: {alt.severity} Incident</h4>
                      
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '999px',
                        backgroundColor: isCritical ? '#fee2e2' : '#fef3c7',
                        color: isCritical ? '#b91c1c' : '#92400e',
                      }}>
                        {alt.severity}
                      </span>

                      {alt.recovered && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <CheckCircle size={10} />
                          <span>RECOVERED TO SAFE</span>
                        </span>
                      )}

                      {alt.acknowledged && (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '999px',
                        }}>
                          Acknowledged
                        </span>
                      )}
                    </div>

                    <p>{alt.message}</p>

                    <div className="alert-meta" style={{ flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={12} />
                        <span>Started: <strong>{formatTimestamp(alt.startTime)}</strong></span>
                      </div>
                      {alt.recovered ? (
                        <>
                          <span>•</span>
                          <span style={{ color: '#059669', fontWeight: 600 }}>
                            Recovered at: {formatTimestamp(alt.recoveredAt)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span>Last Observed: {formatTimestamp(alt.lastObservedTime)}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Initial: <strong>{alt.initialValue}</strong></span>
                      <span>•</span>
                      <span>Latest: <strong>{alt.latestValue}</strong></span>
                      <span>•</span>
                      <span>Source: <code>{alt.deviceId}</code></span>
                    </div>
                  </div>
                </div>

                <div style={{ marginLeft: '1rem', flexShrink: 0 }}>
                  <button
                    onClick={() => acknowledgeAlert(alt.id, !alt.acknowledged)}
                    className="btn-secondary btn-sm"
                    style={{
                      fontSize: '0.76rem',
                      backgroundColor: alt.acknowledged ? '#f1f5f9' : '#ffffff',
                    }}
                  >
                    {alt.acknowledged ? (
                      <>
                        <CheckCheck size={13} color="#059669" />
                        <span>Acknowledged</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} />
                        <span>Acknowledge</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
