import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Send, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  History, 
  HelpCircle, 
  ExternalLink, 
  Check, 
  X, 
  Flame, 
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { 
  fetchSmsStatus, 
  fetchSmsPreferences, 
  saveSmsPreferences, 
  triggerTestSms, 
  fetchSmsHistory 
} from '../services/smsApiService';
import { useAuth } from '../context/AuthContext';

export default function SMSAlertCenterView() {
  const { user } = useAuth();

  // Local form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [isEnabled, setIsEnabled] = useState(true);
  const [minSeverity, setMinSeverity] = useState('CRITICAL');
  const [cooldownMinutes, setCooldownMinutes] = useState(10);
  const [consentGiven, setConsentGiven] = useState(true);

  // Status & History state from backend
  const [backendStatus, setBackendStatus] = useState(null);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [backendOffline, setBackendOffline] = useState(false);

  // Load preferences and status from backend
  const loadData = async () => {
    setLoading(true);
    setStatusMessage(null);

    const [statusRes, prefsRes, historyRes] = await Promise.all([
      fetchSmsStatus(),
      fetchSmsPreferences(),
      fetchSmsHistory(),
    ]);

    if (!statusRes.ok && statusRes.status === 0) {
      setBackendOffline(true);
      // Fallback to local profile if available
      try {
        const cached = JSON.parse(localStorage.getItem('aquasense_user_profile') || '{}');
        if (cached.phone_number) {
          const digits = cached.phone_number.replace(/\D/g, '').slice(-10);
          setPhoneNumber(digits);
        }
      } catch (e) {}
    } else {
      setBackendOffline(false);
      if (statusRes.ok) {
        setBackendStatus(statusRes.data);
      }

      if (prefsRes.ok && prefsRes.data) {
        const p = prefsRes.data;
        if (p.phone_number) {
          const rawDigits = p.phone_number.replace(/\D/g, '').slice(-10);
          setPhoneNumber(rawDigits);
        }
        setIsEnabled(p.is_enabled ?? true);
        setMinSeverity(p.min_severity || 'CRITICAL');
        setCooldownMinutes(p.cooldown_minutes || 10);
        setConsentGiven(p.consent_given ?? true);
      }

      if (historyRes.ok && historyRes.data) {
        setDeliveryHistory(historyRes.data.history || []);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save preferences handler
  const handleSavePreferences = async (e) => {
    if (e) e.preventDefault();
    setStatusMessage(null);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 10-digit Indian mobile number.',
      });
      return;
    }

    if (!consentGiven) {
      setStatusMessage({
        type: 'error',
        text: 'You must grant recipient consent to enable automated SMS notifications.',
      });
      return;
    }

    setSaving(true);
    const fullPhone = `${countryCode} ${cleanDigits}`;

    const res = await saveSmsPreferences({
      phone_number: fullPhone,
      is_enabled: isEnabled,
      min_severity: minSeverity,
      cooldown_minutes: Number(cooldownMinutes),
      consent_given: consentGiven,
    });

    setSaving(false);

    if (res.ok) {
      setStatusMessage({
        type: 'success',
        text: 'SMS notification preferences saved successfully!',
      });
      // Also cache in local storage for instant sync across tabs
      try {
        const cached = JSON.parse(localStorage.getItem('aquasense_user_profile') || '{}');
        cached.phone_number = fullPhone;
        cached.sms_alerts_enabled = isEnabled;
        localStorage.setItem('aquasense_user_profile', JSON.stringify(cached));
      } catch (e) {}
      loadData();
    } else {
      setStatusMessage({
        type: 'error',
        text: res.data?.detail || res.error || 'Failed to save preferences to backend.',
      });
    }
  };

  // Test SMS handler
  const handleSendTestSms = async () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 10-digit mobile number before sending a test SMS.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    setStatusMessage(null);

    const fullPhone = `${countryCode} ${cleanDigits}`;
    const res = await triggerTestSms(fullPhone);

    setTesting(false);

    if (res.ok && res.data) {
      setTestResult(res.data);
      if (res.data.success) {
        setStatusMessage({
          type: 'success',
          text: `Test SMS accepted by ${res.data.provider || 'Fast2SMS'} gateway! (Request ID: ${res.data.request_id || 'N/A'})`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.data.message || res.data.error_details || 'SMS delivery failed.',
        });
      }
      loadData();
    } else {
      const errDetail = res.data?.detail || res.error || 'Failed to dispatch test message.';
      setTestResult({
        success: false,
        status: res.status === 429 ? 'RATE_LIMITED' : 'FAILED',
        error_details: errDetail,
      });
      setStatusMessage({
        type: res.status === 429 ? 'warning' : 'error',
        text: errDetail,
      });
    }
  };

  const isConfigured = backendStatus?.is_provider_configured;
  const walletBalance = backendStatus?.wallet?.balance;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Smartphone size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                  SMS Alert Center
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Custom emergency cellular notifications powered by Fast2SMS &amp; edge telemetry
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={loadData}
              disabled={loading}
              className="btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
              title="Refresh provider status and history"
            >
              <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-light)'
        }}>
          {/* Provider Status Pill */}
          <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              SMS Delivery Provider
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.3rem' }}>
              <span className="pulse-dot" style={{ backgroundColor: isConfigured ? '#10b981' : '#f59e0b' }}></span>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isConfigured ? '#047857' : '#b45309' }}>
                {isConfigured ? 'Fast2SMS (Active)' : 'Fast2SMS (Not Configured)'}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {isConfigured ? 'Direct bulkV2 Quick Route' : 'Requires FAST2SMS_API_KEY in .env'}
            </div>
          </div>

          {/* Wallet Balance Pill */}
          <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Fast2SMS Balance
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal-900)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CreditCard size={15} color="#0d9488" />
              <span>{walletBalance !== undefined && walletBalance !== null ? `₹${walletBalance}` : isConfigured ? 'Verifying...' : 'N/A'}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              {isConfigured ? 'Official account wallet' : 'Set key to inspect balance'}
            </div>
          </div>

          {/* Alert Readiness */}
          <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Hazard Alert Readiness
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: isEnabled ? '#059669' : '#64748b' }}>
                {isEnabled ? 'Active & Listening' : 'Alerts Paused'}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Trigger: {minSeverity} Hazards
            </div>
          </div>

          {/* Cooldown Status */}
          <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Cooldown Anti-Spam
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: backendStatus?.in_cooldown ? '#ea580c' : '#0d9488', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={15} />
              <span>
                {backendStatus?.in_cooldown 
                  ? `Active (${backendStatus?.cooldown_remaining_seconds}s)`
                  : `${cooldownMinutes} min window`}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Prevents duplicate SMS charges
            </div>
          </div>
        </div>
      </div>

      {/* Backend Offline Warning Banner */}
      {backendOffline && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>
              FastAPI Backend Gateway is Not Running on Port 8000
            </div>
            <p style={{ fontSize: '0.82rem', color: '#78350f', marginTop: '0.25rem', lineHeight: 1.45 }}>
              The frontend connects to <code>http://localhost:8000/api/sms/*</code>. To run the backend and enable live Fast2SMS dispatch, execute in PowerShell:
              <br />
              <code style={{ display: 'inline-block', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', marginTop: '0.35rem' }}>
                uvicorn fastapi_backend:app --port 8000 --reload
              </code>
            </p>
          </div>
        </div>
      )}

      {/* Provider Missing Setup Guide Card (Honest State) */}
      {!isConfigured && !backendOffline && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <AlertCircle size={22} color="#0d9488" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Fast2SMS Delivery Provider Setup Required
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Real carrier SMS messages require a valid Fast2SMS API key in your backend environment.
              </p>
            </div>
          </div>

          <div style={{
            fontSize: '0.84rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            backgroundColor: '#ffffff',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                Visit <strong><a href="https://www.fast2sms.com" target="_blank" rel="noreferrer" style={{ color: 'var(--teal-700)', textDecoration: 'underline' }}>fast2sms.com</a></strong> and sign in or create a free account.
              </li>
              <li>
                Navigate to <strong>Dev API</strong> in your Fast2SMS dashboard and copy your unique <strong>API Key</strong>.
              </li>
              <li>
                Add the key to your backend environment or create an entry in your local <code>.env</code> file:
                <div style={{ marginTop: '0.35rem' }}>
                  <code style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', border: '1px solid var(--border-light)' }}>
                    FAST2SMS_API_KEY=your_fast2sms_api_key_here
                  </code>
                </div>
              </li>
              <li>
                Restart the FastAPI backend server (<code>uvicorn fastapi_backend:app --port 8000</code>).
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* Feedback Alert Banners */}
      {statusMessage && (
        <div className={`alert-message ${statusMessage.type || 'error'}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', margin: 0 }}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <span style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Two-Column Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Card 1: Recipient Phone Number & Test Dispatch */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title-group">
                <Smartphone size={20} color="#0d9488" />
                <div>
                  <h3 className="card-title">Recipient Mobile Phone</h3>
                  <p className="card-subtitle">Configure destination mobile handset for water hazard alerts</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="sms-phone">
                    Mobile Number (10 Digits) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{
                    fontSize: '0.74rem',
                    color: phoneNumber.length === 10 ? '#059669' : '#b45309',
                    fontWeight: 700
                  }}>
                    {phoneNumber.length === 10 ? '✓ 10 Digits Valid' : `${phoneNumber.length}/10 Digits`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {/* Country Code Pill */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.68rem 0.85rem',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    color: 'var(--teal-900)',
                    userSelect: 'none'
                  }}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>

                  {/* 10-Digit Mobile Input */}
                  <div className="input-with-icon" style={{ flex: 1 }}>
                    <Smartphone size={16} className="input-icon" />
                    <input
                      id="sms-phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(digits);
                      }}
                      maxLength={10}
                      placeholder="9876543210"
                      className="form-input"
                      required
                      autoComplete="tel-national"
                    />
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.35 }}>
                  Fixed Indian country prefix <strong>+91</strong>. Used to dispatch real-time emergency notifications whenever water quality crosses unsafe safety limits.
                </p>
              </div>

              {/* Action Buttons: Save & Test */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Phone Number'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendTestSms}
                  disabled={testing}
                  className="btn-secondary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontWeight: 700,
                    color: 'var(--teal-800)',
                    borderColor: 'var(--teal-300)'
                  }}
                >
                  <Send size={14} />
                  <span>{testing ? 'Transmitting...' : 'Send Test SMS'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Detailed Test Result Box (Honest status tracking) */}
          {testResult && (
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <strong style={{ color: testResult.success ? '#065f46' : '#991b1b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>Test SMS Result: {testResult.status}</span>
                </strong>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Provider: {testResult.provider || 'Fast2SMS'}
                </span>
              </div>
              <div style={{ color: testResult.success ? '#047857' : '#b91c1c', lineHeight: 1.45 }}>
                {testResult.message || testResult.error_details}
              </div>
              {testResult.request_id && (
                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                  Gateway Request ID: <code>{testResult.request_id}</code>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card 2: Notification Preferences & Threshold Rules */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <Sliders size={20} color="#0d9488" />
              <div>
                <h3 className="card-title">Alert Rules &amp; Cooldowns</h3>
                <p className="card-subtitle">Tune automated hazard criteria and prevent duplicate messages</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Enable SMS Toggle */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              border: '1px solid var(--border-light)'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  Enable SMS Notifications
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Dispatch real-time carrier SMS when readings violate safety thresholds
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--teal-600)', cursor: 'pointer' }}
              />
            </label>

            {/* Severity Trigger Filter */}
            <div>
              <label className="form-label">Minimum Severity Trigger</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setMinSeverity('CRITICAL')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${minSeverity === 'CRITICAL' ? 'var(--teal-600)' : 'var(--border-light)'}`,
                    backgroundColor: minSeverity === 'CRITICAL' ? 'var(--teal-50)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: minSeverity === 'CRITICAL' ? 'var(--teal-900)' : 'var(--text-main)' }}>
                    🚨 Critical Only (Recommended)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    TDS &gt; 2000, Turbidity &gt; 5 NTU, extreme pH
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMinSeverity('WARNING')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${minSeverity === 'WARNING' ? 'var(--teal-600)' : 'var(--border-light)'}`,
                    backgroundColor: minSeverity === 'WARNING' ? 'var(--teal-50)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: minSeverity === 'WARNING' ? 'var(--teal-900)' : 'var(--text-main)' }}>
                    ⚠️ All Deviations (Warning + Critical)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    TDS &gt; 500, Turbidity &gt; 1 NTU, mild shifts
                  </div>
                </button>
              </div>
            </div>

            {/* Cooldown Period Selector */}
            <div>
              <label className="form-label" htmlFor="cooldown-select">
                Anti-Duplicate Cooldown Window
              </label>
              <select
                id="cooldown-select"
                value={cooldownMinutes}
                onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                className="form-input"
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <option value={5}>5 Minutes (Fast testing)</option>
                <option value={10}>10 Minutes (Standard default)</option>
                <option value={15}>15 Minutes (Extended protection)</option>
                <option value={30}>30 Minutes (Maximum conservation)</option>
              </select>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Suppresses duplicate SMS messages during continuous readings in the same breached state.
              </p>
            </div>

            {/* Recipient Consent Checkbox */}
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              padding: '0.75rem 0.9rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--teal-600)', marginTop: '2px' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#065f46', lineHeight: 1.4 }}>
                <strong>Explicit Recipient Consent:</strong> I confirm that I am the authorized owner of this mobile number and consent to receive automated water safety emergency SMS notifications.
              </span>
            </label>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary"
              style={{ justifyContent: 'center', fontWeight: 700 }}
            >
              {saving ? 'Updating...' : 'Save Alert Rules'}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Recent SMS Delivery History Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <History size={20} color="#0d9488" />
            <div>
              <h3 className="card-title">Recent SMS Delivery History</h3>
              <p className="card-subtitle">Verifiable log of real cellular SMS dispatch attempts</p>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Total Logged: <strong>{deliveryHistory.length}</strong>
          </span>
        </div>

        {deliveryHistory.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <MessageSquare size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              No SMS Delivery Records Yet
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
              No messages have been dispatched yet. Register your phone number above and click <strong>Send Test SMS</strong> or trigger a contamination spike in the dashboard to generate your first delivery log entry.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Trigger Reason</th>
                  <th>Recipient</th>
                  <th>Message Body Preview</th>
                  <th>Gateway</th>
                  <th>Provider Request ID</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {deliveryHistory.map((item, idx) => {
                  const status = String(item.status || 'PENDING').toUpperCase();
                  const isSent = status === 'SENT' || status === 'DELIVERED';
                  const isRateLimit = status === 'RATE_LIMITED';
                  const isUnconfigured = status === 'NOT_CONFIGURED';

                  return (
                    <tr key={item.id || idx}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }) : 'Just now'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        {item.trigger_reason || 'MANUAL_TEST'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {item.phone_number}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '280px' }} title={item.message}>
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.message}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--teal-800)' }}>
                        {item.provider || 'Fast2SMS'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {item.provider_request_id ? (
                          <code>{item.provider_request_id}</code>
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: isSent ? '#ecfdf5' : isRateLimit ? '#fff7ed' : isUnconfigured ? '#f1f5f9' : '#fef2f2',
                          color: isSent ? '#047857' : isRateLimit ? '#c2410c' : isUnconfigured ? '#475569' : '#b91c1c',
                          border: `1px solid ${isSent ? '#a7f3d0' : isRateLimit ? '#fed7aa' : isUnconfigured ? '#cbd5e1' : '#fecaca'}`
                        }}>
                          {isSent ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <AlertCircle size={12} />
                          )}
                          <span>{status}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
