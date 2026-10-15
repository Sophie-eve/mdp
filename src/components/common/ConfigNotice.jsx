import React, { useState } from 'react';
import { AlertTriangle, Key, ExternalLink, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ConfigNotice({ dismissible = false }) {
  const { isConfigured, enterGuestPreview, isGuestPreview } = useAuth();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (isConfigured) return null;

  const sampleEnv = `VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key`;

  const copySample = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      border: '1px solid #fde68a',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      marginBottom: '1.75rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            flexShrink: 0,
            border: '1px solid #fcd34d'
          }}>
            <Key size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>
              Supabase Configuration Notice
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#78350f', lineHeight: 1.45 }}>
              The frontend is ready to connect to your existing Supabase project. Add your project credentials to a local <code>.env</code> file.
              {isGuestPreview ? ' Currently running with the 8 seeded readings preview dataset.' : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="btn-secondary btn-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Setup Guide' : 'Setup Guide'}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px dashed #fcd34d' }}>
          <p style={{ fontSize: '0.84rem', color: '#78350f', marginBottom: '0.75rem' }}>
            <strong>Quick Setup Instructions:</strong>
          </p>
          <ol style={{ fontSize: '0.84rem', color: '#78350f', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li>Create a <code>.env</code> file in this project root directory (next to <code>package.json</code>).</li>
            <li>Copy your Project URL and Publishable (Anon) Key from <strong>Supabase Dashboard &gt; Project Settings &gt; API</strong>.</li>
            <li>Paste them as shown below and restart the Vite dev server (or Vite will auto-reload).</li>
          </ol>

          <div style={{
            position: 'relative',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            overflowX: 'auto'
          }}>
            <button
              onClick={copySample}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '0.3rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre style={{ margin: 0 }}>{sampleEnv}</pre>
          </div>

          <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertTriangle size={14} color="#d97706" />
            <span>Never commit your actual credentials to git or publish private service-role keys in frontend variables.</span>
          </div>
        </div>
      )}
    </div>
  );
}
