import React, { useEffect, useState } from 'react';
import { 
  AlertOctagon, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Radio, 
  Send, 
  ExternalLink,
  Flame,
  Volume2
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function EmergencySmsModal({ onNavigate }) {
  const { emergencySms, dismissEmergencySms, triggerEmergencySmsDispatch } = useData();
  const [copied, setCopied] = useState(false);

  // Play browser audio alert on incoming emergency SMS
  useEffect(() => {
    if (emergencySms) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // AudioContext might be blocked until user gesture, ignore
      }
    }
  }, [emergencySms]);

  if (!emergencySms) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      right: '1.25rem',
      zIndex: 9999,
      maxWidth: '460px',
      width: 'calc(100% - 2.5rem)',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid #ef4444',
        boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.35), 0 0 0 1px rgba(239, 68, 68, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Top Hazard Alert Header */}
        <div style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={18} className="pulse-dot" />
            <span style={{ fontWeight: 800, fontSize: '0.86rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Hazard Spike • Emergency SMS Dispatched
            </span>
          </div>

          <button
            onClick={dismissEmergencySms}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.2rem',
              borderRadius: '4px'
            }}
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--teal-900)', fontWeight: 700, fontSize: '0.88rem' }}>
              <Smartphone size={16} color="#0d9488" />
              <span>Target Mobile: {emergencySms.recipientPhone}</span>
            </div>

            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#047857',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <CheckCircle2 size={12} />
              <span>{emergencySms.timestamp}</span>
            </span>
          </div>

          {/* SMS Notification Message Bubble */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            color: '#0f172a',
            lineHeight: 1.5,
            marginBottom: '0.85rem',
            position: 'relative'
          }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.25rem' }}>
              💬 Cellular SMS Payload:
            </div>
            {emergencySms.message}
          </div>

          <div style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.45,
            marginBottom: '1rem',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '0.55rem 0.75rem',
            borderRadius: '6px'
          }}>
            💡 <strong>Carrier Dispatch Active:</strong> When your Python gateway in <code>fastapi_backend.py</code> is connected to Twilio or Fast2SMS, this alert delivers straight to your physical mobile phone via cellular SMS.
          </div>

          {/* Action footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap' }}>
            {onNavigate && (
              <button
                onClick={() => {
                  dismissEmergencySms();
                  onNavigate('sms');
                }}
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: 'var(--teal-300)', color: 'var(--teal-800)' }}
              >
                <Smartphone size={12} />
                <span>Open SMS Center</span>
              </button>
            )}

            <button
              onClick={() => {
                triggerEmergencySmsDispatch(emergencySms.type, emergencySms.value, emergencySms.unit);
              }}
              className="btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Send size={12} />
              <span>Resend SMS</span>
            </button>

            <button
              onClick={dismissEmergencySms}
              className="btn-primary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
