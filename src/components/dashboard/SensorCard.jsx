import React from 'react';
import { 
  Waves, 
  FlaskConical, 
  Droplet, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { getStatusTheme } from '../../utils/thresholds';

const ICON_MAP = {
  tds: Waves,
  ph: FlaskConical,
  turbidity: Droplet,
  temp: Thermometer,
};

export default function SensorCard({ 
  type, 
  name, 
  value, 
  unit, 
  status = 'SAFE', 
  timestamp, 
  thresholdNote,
  description 
}) {
  const Icon = ICON_MAP[type] || Droplet;
  const theme = getStatusTheme(status);

  // Status icon
  const StatusIcon = 
    status === 'SAFE' ? CheckCircle2 :
    status === 'WARNING' ? AlertTriangle :
    status === 'CRITICAL' ? AlertOctagon : HelpCircle;

  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    : 'N/A';

  const displayValue = value !== null && value !== undefined && !isNaN(value)
    ? (typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value)
    : '--';

  return (
    <div className="sensor-card">
      <div className="sensor-card-top">
        <div 
          className="sensor-icon-badge"
          style={{ backgroundColor: theme.bg, color: theme.solid }}
        >
          <Icon size={22} />
        </div>

        <div 
          className="sensor-status-badge"
          style={{
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          }}
        >
          <StatusIcon size={13} />
          <span>{status}</span>
        </div>
      </div>

      <span className="sensor-name">{name}</span>

      <div className="sensor-reading-row">
        <span className="sensor-value">{displayValue}</span>
        {unit && <span className="sensor-unit">{unit}</span>}
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', minHeight: '1.2rem' }}>
        {thresholdNote || description}
      </div>

      <div className="sensor-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={12} />
          <span>Updated {formattedTime}</span>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {type.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
