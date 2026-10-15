import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  HelpCircle, 
  Sparkles,
  Clock,
  Radio
} from 'lucide-react';

export default function OverallStatusBanner({ 
  status = 'SAFE', 
  evaluation,
  deviceId,
  recordedAt,
  isSimulated = true,
  isStale = false,
  dataSourceMode = 'SIMULATION'
}) {
  const normStatus = String(status || '').toUpperCase();

  const config = {
    SAFE: {
      className: 'safe',
      icon: CheckCircle2,
      title: 'Water Quality: SAFE',
      description: 'All 4 monitored parameters (TDS, pH, Turbidity, Temperature) fall within optimal baseline ranges.',
      iconColor: '#10b981',
    },
    WARNING: {
      className: 'warning',
      icon: AlertTriangle,
      title: 'Water Quality: WARNING',
      description: evaluation?.issues?.length 
        ? `Attention required: ${evaluation.issues.join(' • ')}`
        : 'One or more parameters have exceeded standard warning margins.',
      iconColor: '#f59e0b',
    },
    CRITICAL: {
      className: 'critical',
      icon: AlertOctagon,
      title: 'Water Quality: CRITICAL HAZARD',
      description: evaluation?.issues?.length
        ? `Severe alert: ${evaluation.issues.join(' • ')}`
        : 'Critical contamination thresholds breached. Action recommended immediately.',
      iconColor: '#ef4444',
    },
    'SENSOR ERROR': {
      className: 'error',
      icon: HelpCircle,
      title: 'Water Quality: SENSOR ERROR',
      description: 'Sensor data is unreadable, disconnected, or missing. Cannot evaluate water safety.',
      iconColor: '#64748b',
    },
  }[normStatus] || {
    className: 'error',
    icon: HelpCircle,
    title: 'Water Quality: SENSOR ERROR',
    description: 'Unknown or missing telemetry data.',
    iconColor: '#64748b',
  };

  const Icon = config.icon;

  const formattedDate = recordedAt 
    ? new Date(recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'Awaiting stream...';

  const triggeredParams = evaluation?.triggeredParameters || [];

  return (
    <div className={`overall-status-banner ${config.className}`}>
      <div className="status-banner-content">
        <div 
          className="status-huge-icon"
          style={{ backgroundColor: `${config.iconColor}20`, color: config.iconColor }}
        >
          <Icon size={32} />
        </div>

        <div className="status-banner-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h2>{config.title}</h2>

            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              backgroundColor: isSimulated ? '#eff6ff' : '#ecfdf5', 
              color: isSimulated ? '#1d4ed8' : '#047857',
              border: `1px solid ${isSimulated ? '#bfdbfe' : '#a7f3d0'}`,
              padding: '0.15rem 0.5rem', 
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              {isSimulated ? <Sparkles size={11} /> : <Radio size={11} />}
              <span>{isSimulated ? 'DEMO / SIMULATED MODE' : 'HARDWARE CONNECTED'}</span>
            </span>

            {isStale && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#fff7ed',
                color: '#c2410c',
                border: '1px solid #fed7aa',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px'
              }}>
                STALE TELEMETRY (&gt;15m)
              </span>
            )}
          </div>

          <p>{config.description}</p>

          {/* Triggering Parameter Attribution */}
          {triggeredParams.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Triggered by:
              </span>
              {triggeredParams.map((tp, idx) => (
                <span 
                  key={idx}
                  style={{
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: tp.status === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                    color: tp.status === 'CRITICAL' ? '#991b1b' : '#92400e',
                    border: `1px solid ${tp.status === 'CRITICAL' ? '#fecaca' : '#fde68a'}`,
                  }}
                >
                  {tp.param}: {tp.value} {tp.unit} ({tp.status})
                </span>
              ))}
            </div>
          )}

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={12} />
              <span>Latest evaluated packet: {formattedDate}</span>
            </span>
            <span>•</span>
            <span>Source: <code>{deviceId || 'ESP32-NODE-01'}</code></span>
          </div>
        </div>
      </div>
    </div>
  );
}
