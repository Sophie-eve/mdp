import React from 'react';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Clock, 
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function SummaryCards() {
  const { readings, alerts, unacknowledgedAlertsCount, deviceStatus, lastSyncTime } = useData();

  const totalReadings = readings.length;
  const safeCount = readings.filter(r => (r.status || '').toUpperCase() === 'SAFE').length;
  const warningCount = readings.filter(r => (r.status || '').toUpperCase() === 'WARNING').length;
  const criticalCount = readings.filter(r => ['CRITICAL', 'UNSAFE'].includes((r.status || '').toUpperCase())).length;

  const cards = [
    {
      title: 'Total Logged Readings',
      value: totalReadings,
      subtitle: `${readings.filter(r => r.is_simulated).length} simulated • ${readings.filter(r => !r.is_simulated).length} hardware`,
      icon: Database,
      bg: 'var(--teal-50)',
      color: 'var(--teal-700)',
    },
    {
      title: 'Active Threshold Alerts',
      value: unacknowledgedAlertsCount,
      subtitle: `${alerts.length} total generated flags`,
      icon: AlertTriangle,
      bg: unacknowledgedAlertsCount > 0 ? '#fef2f2' : 'var(--teal-50)',
      color: unacknowledgedAlertsCount > 0 ? '#ef4444' : 'var(--teal-700)',
    },
    {
      title: 'Safe Quality Ratio',
      value: totalReadings > 0 ? `${Math.round((safeCount / totalReadings) * 100)}%` : '0%',
      subtitle: `${safeCount} safe, ${warningCount} warn, ${criticalCount} crit`,
      icon: ShieldCheck,
      bg: '#ecfdf5',
      color: '#059669',
    },
    {
      title: 'IoT Node Connectivity',
      value: deviceStatus,
      subtitle: lastSyncTime ? `Synced ${lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Standby',
      icon: Radio,
      bg: deviceStatus === 'ONLINE' ? '#f0fdfa' : '#fffbeb',
      color: deviceStatus === 'ONLINE' ? '#0d9488' : '#d97706',
    },
  ];

  return (
    <div className="summary-cards-row">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="summary-card">
            <div 
              className="summary-icon-box"
              style={{ backgroundColor: card.bg, color: card.color }}
            >
              <Icon size={22} />
            </div>
            <div className="summary-info">
              <h4>{card.title}</h4>
              <div className="summary-number">{card.value}</div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
