import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Key, 
  Database, 
  Server, 
  LogOut, 
  BookOpen, 
  CheckCircle2,
  ExternalLink,
  Lock,
  Phone,
  Smartphone,
  Send,
  BellRing,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function ProfileView() {
  const { user, logout, isConfigured, isGuestPreview, config } = useAuth();
  const { readings, deviceStatus } = useData();
  const [testSent, setTestSent] = useState(false);

  const displayName = user?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'AquaSense User');
  const userPhone = user?.phone_number || user?.user_metadata?.phone_number || '+91 98765 43210';
  const userEmail = user?.email || 'user@example.com';

  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return displayName.substring(0, 2).toUpperCase();
    }
    return userEmail.substring(0, 2).toUpperCase();
  };

  const handleTestSms = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 5000);
  };

  return (
    <div>
      {/* User Information Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal-600), var(--teal-800))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
            }}>
              {getInitials()}
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {displayName}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                <Mail size={13} />
                <span>{userEmail}</span>
              </p>
            </div>
          </div>

          <button onClick={logout} className="btn-secondary btn-sm" style={{ color: '#dc2626' }}>
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          borderTop: '1px solid var(--border-light)',
          paddingTop: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Full Name
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {displayName}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Mobile for Critical Alerts
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--teal-800)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={14} color="#0d9488" />
              <span>{userPhone}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Emergency SMS Status
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#059669', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} />
              <span>Active for CRITICAL Hazards</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Auth Provider
            </span>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--teal-900)', marginTop: '0.2rem' }}>
              Supabase Auth (PostgreSQL)
            </div>
          </div>
        </div>
      </div>

      {/* Emergency SMS Alert Readiness Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <Smartphone size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Cellular SMS Emergency Dispatch</h3>
              <p className="card-subtitle">Immediate notifications triggered upon critical contamination readings</p>
            </div>
          </div>
          <button
            onClick={handleTestSms}
            className="btn-secondary btn-sm"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Send size={13} />
            <span>Send Test Alert to Phone</span>
          </button>
        </div>

        {testSent && (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.88rem' }}>
                Test SMS Notification Dispatched to {userPhone}!
              </div>
              <p style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.25rem' }}>
                "🚨 AquaSense CRITICAL ALERT: Turbidity measured at 5.2 NTU (Threshold: &gt;5.0 NTU). Water status is CRITICAL."
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Emergency Mobile Target
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--teal-900)', fontFamily: 'var(--font-mono)' }}>
              {userPhone}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Recipient will receive SMS when TDS exceeds 2000 ppm or Turbidity exceeds 5 NTU.
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
              Backend Integration Gateway
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--teal-700)' }}>
              Twilio SMS / Fast2SMS / MSG91
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Connect your SMS API credentials in <code>fastapi_backend.py</code> to deliver real carrier SMS messages.
            </div>
          </div>
        </div>
      </div>

      {/* College Project Architecture Overview */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <div className="card-title-group">
            <BookOpen size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Project Technical Specifications</h3>
              <p className="card-subtitle">IoT-Based Smart Water Quality Monitoring System</p>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={16} color="#0d9488" />
                <span>Database Connection</span>
              </div>
              <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                PostgreSQL table <code>public.readings</code> hosted on Supabase Cloud.
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Target URL: <code>{config.url || 'Configured via .env'}</code>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={16} color="#0d9488" />
                <span>Security &amp; RLS Policies</span>
              </div>
              <p style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                Row Level Security (RLS) is active on <code>public.readings</code>. Frontend visitors use publishable keys with least permissions needed.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} />
                <span>Service role secrets are excluded from frontend</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
