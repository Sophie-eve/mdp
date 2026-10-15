import React, { useState } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  Sliders, 
  Volume2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  PhoneCall,
  Smartphone,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { THRESHOLDS } from '../utils/thresholds';
import { useAuth } from '../context/AuthContext';

export default function NotificationSettingsView({ onNavigate }) {
  const { user } = useAuth();
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [audioChime, setAudioChime] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [testSmsStatus, setTestSmsStatus] = useState(null);

  const userPhone = user?.phone_number || user?.user_metadata?.phone_number || '+91 98765 43210';
  const userName = user?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSendTestSms = () => {
    setTestSmsStatus('sending');
    setTimeout(() => {
      setTestSmsStatus('sent');
      setTimeout(() => setTestSmsStatus(null), 6000);
    }, 1200);
  };

  return (
    <div>

      {/* Threshold Reference Table Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Sliders size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Project Safety Threshold Rules</h3>
              <p className="card-subtitle">Project-defined parameters and evaluation priorities</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Monitored Parameter</th>
                <th>SAFE Range</th>
                <th>WARNING Threshold</th>
                <th>CRITICAL Threshold</th>
                <th>Evaluation Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>TDS (Total Dissolved Solids)</td>
                <td>0 – 500 ppm</td>
                <td>&gt; 500 ppm</td>
                <td>&gt; 2000 ppm</td>
                <td>CRITICAL takes priority</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>pH Level</td>
                <td>6.5 – 8.5</td>
                <td>Outside 6.5 – 8.5</td>
                <td>Extreme (&lt;4.0 or &gt;10.5)</td>
                <td>CRITICAL takes priority</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Turbidity (Water Clarity)</td>
                <td>0 – 1.0 NTU</td>
                <td>&gt; 1.0 NTU</td>
                <td>&gt; 5.0 NTU</td>
                <td>CRITICAL takes priority</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Water Temperature</td>
                <td>10.0°C – 35.0°C</td>
                <td>Outside 10°C – 35°C</td>
                <td>Freezing or Boiling</td>
                <td>WARNING if abnormal</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Missing / Null Sensor Values</td>
                <td>Never Evaluated as Safe</td>
                <td colSpan="3" style={{ color: 'var(--text-muted)' }}>
                  Strictly designated as <strong>SENSOR ERROR</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Local Notification Display Preferences */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <BellRing size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">In-Browser Telemetry Alert Preferences</h3>
              <p className="card-subtitle">Configure client-side alert indicators and UI banners</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  In-App Toast Banners
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Display banner alerts whenever a reading violates safety bounds
                </div>
              </div>
              <input
                type="checkbox"
                checked={inAppAlerts}
                onChange={(e) => setInAppAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Simulated Audio Chime
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Play subtle browser chime on incoming CRITICAL hazard readings
                </div>
              </div>
              <input
                type="checkbox"
                checked={audioChime}
                onChange={(e) => setAudioChime(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Filter to CRITICAL Hazards Only
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ignore mild WARNING alerts and only flag severe safety breaches
                </div>
              </div>
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={(e) => setCriticalOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)' }}
              />
            </label>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button type="submit" className="btn-primary">
              Save Preferences
            </button>
            {saved && (
              <span style={{ fontSize: '0.84rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={16} />
                <span>Preferences saved!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Emergency Mobile SMS Alert Gateway Card */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Smartphone size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Emergency Mobile SMS Dispatch</h3>
              <p className="card-subtitle">Automated cellular SMS notifications on critical contamination hazards</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('sms')}
                className="btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--teal-300)', color: 'var(--teal-800)' }}
              >
                <Smartphone size={14} />
                <span>Open Full SMS Alert Center</span>
              </button>
            )}
            <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="pulse-dot" style={{ backgroundColor: '#10b981' }}></span>
              Fast2SMS Ready
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                Recipient Mobile Number
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--teal-900)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PhoneCall size={18} color="#0d9488" />
                <span>{userPhone}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Configured for: <strong>{userName}</strong> ({user?.email || 'Active User'})
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendTestSms}
              disabled={testSmsStatus === 'sending'}
              className="btn-secondary"
              style={{
                borderColor: 'var(--teal-300)',
                backgroundColor: '#ffffff',
                color: 'var(--teal-800)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Send size={15} />
              <span>{testSmsStatus === 'sending' ? 'Transmitting SMS...' : 'Test SMS Alert to Mobile'}</span>
            </button>
          </div>

          {testSmsStatus === 'sent' && (
            <div style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <CheckCircle2 size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>
                  Simulated SMS Dispatched to {userPhone}!
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: '#1e293b',
                  border: '1px solid #d1fae5',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                }}>
                  💬 <strong>SMS Preview:</strong> "🚨 [AquaSense CRITICAL ALERT] Hazard detected on ESP32 Node 1! TDS: 2150 ppm (Threshold: &gt;2000 ppm), Turbidity: 5.4 NTU. Immediate filtration shutdown advised."
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                ⚡ Auto-Trigger Rule
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                SMS dispatch occurs only when reading enters <strong>CRITICAL</strong> status (TDS &gt; 2000 ppm or Turbidity &gt; 5.0 NTU). Edge-triggered to avoid duplicate SMS costs.
              </p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                🔗 Supported SMS Gateways
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Ready to connect with <strong>Twilio SMS</strong>, <strong>Fast2SMS (India)</strong>, or <strong>MSG91</strong> via Python FastAPI backend (<code>fastapi_backend.py</code>).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
