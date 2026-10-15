import React, { useState } from 'react';
import { 
  Droplets, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  ArrowLeft,
  Smartphone,
  Sparkles,
  Radio,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfigNotice from '../common/ConfigNotice';

export default function AuthView({ onBackToDashboard }) {
  const { login, signup, authError, clearAuthError, enterGuestPreview } = useAuth();
  const [mode, setMode] = useState('signup'); // Default to signup so new users see name + phone + email fields
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    clearAuthError();

    // Basic Validation
    if (!email || !password) {
      setStatusMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address (e.g., yourname@gmail.com).' });
      return;
    }

    if (password.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setStatusMessage({ type: 'error', text: 'Please enter your Full Name.' });
        return;
      }

      const cleanDigits = phoneNumber.replace(/\D/g, '');
      if (cleanDigits.length !== 10) {
        setStatusMessage({ type: 'error', text: 'Please enter a valid 10-digit mobile number (e.g. 9876543210).' });
        return;
      }

      if (password !== confirmPassword) {
        setStatusMessage({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to authenticate. Please check your credentials.' });
      } else {
        if (onBackToDashboard) {
          onBackToDashboard();
        }
      }
    } else {
      const cleanDigits = phoneNumber.replace(/\D/g, '');
      const fullPhoneNumber = `+91 ${cleanDigits}`;

      const res = await signup({
        email,
        password,
        fullName,
        phoneNumber: fullPhoneNumber,
        smsAlertsEnabled,
      });
      setLoading(false);

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: res.message || 'Account successfully created and emergency SMS alert profile saved!',
        });
        // Navigate directly to live simulation dashboard
        setTimeout(() => {
          if (onBackToDashboard) onBackToDashboard();
        }, 1000);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Could not register user.' });
      }
    }
  };

  const handleBypass = () => {
    const cleanDigits = phoneNumber ? phoneNumber.replace(/\D/g, '').slice(0, 10) : '9876543210';
    enterGuestPreview(fullName || 'Shailja Singh', `+91 ${cleanDigits}`);
    if (onBackToDashboard) {
      onBackToDashboard();
    }
  };

  return (
    <div className="auth-wrapper" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '540px', width: '100%' }}>
        {/* Back to dashboard button if provided */}
        {onBackToDashboard && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                fontWeight: 600,
                color: 'var(--teal-900)'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Live Dashboard</span>
            </button>
          </div>
        )}

        <ConfigNotice />

        <div className="auth-card" style={{ maxWidth: '100%' }}>
          {/* Header */}
          <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
            <div className="auth-logo-badge">
              <Droplets size={28} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              AquaSense Monitor
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Smart Water Quality Monitoring &amp; Cellular Alert System
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-light)'
          }}>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setStatusMessage(null);
                clearAuthError();
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                fontSize: '0.88rem',
                fontWeight: mode === 'signup' ? 700 : 500,
                backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                color: mode === 'signup' ? 'var(--teal-900)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setStatusMessage(null);
                clearAuthError();
              }}
              style={{
                flex: 1,
                padding: '0.6rem',
                fontSize: '0.88rem',
                fontWeight: mode === 'login' ? 700 : 500,
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? 'var(--teal-900)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
          </div>

          {/* Status feedback banner */}
          {(statusMessage || authError) && (
            <div className={`alert-message ${statusMessage?.type || 'error'}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                {statusMessage?.type === 'success' ? (
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                )}
                <span style={{ fontSize: '0.86rem' }}>{statusMessage?.text || authError}</span>
              </div>
              {String(statusMessage?.text || authError).toLowerCase().includes('security purposes') && (
                <div style={{ fontSize: '0.78rem', color: '#78350f', backgroundColor: '#fef3c7', padding: '0.4rem 0.6rem', borderRadius: '4px', marginTop: '0.3rem', border: '1px solid #fde68a' }}>
                  💡 <strong>Supabase Security Cooldown:</strong> Outgoing email provider rate limit triggered. You can click <strong>Instant Dashboard Access</strong> below to immediately proceed.
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name field (Signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-name">
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="auth-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Shailja Singh"
                    className="form-input"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email field (Open to all gmails and domains) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-email">
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.74rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                  Any Email / Gmail accepted
                </span>
              </div>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="form-input"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Mobile Number for SMS Alerts (Signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label" htmlFor="auth-phone">
                    Mobile Number (10 Digits) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ 
                    fontSize: '0.74rem', 
                    color: phoneNumber.length === 10 ? '#059669' : '#b45309', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.2rem' 
                  }}>
                    <Smartphone size={12} />
                    {phoneNumber.length === 10 ? '✓ 10 Digits Valid' : `${phoneNumber.length}/10 Digits`}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  {/* Fixed Non-removable +91 Country Badge */}
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
                    userSelect: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>🇮🇳</span>
                    <span>+91</span>
                  </div>

                  {/* Strict 10-Digit Numeric Only Input */}
                  <div className="input-with-icon" style={{ flex: 1 }}>
                    <Phone size={16} className="input-icon" />
                    <input
                      id="auth-phone"
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phoneNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(digitsOnly);
                      }}
                      maxLength={10}
                      placeholder="9876543210"
                      className="form-input"
                      required
                      autoComplete="tel-national"
                    />
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.35 }}>
                  Fixed country code <strong>+91</strong>. Type your 10-digit mobile number to receive automated SMS alerts when water quality reaches <strong>CRITICAL</strong> hazard levels (TDS &gt; 2000 ppm, Turbidity &gt; 5.0 NTU).
                </p>
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label" htmlFor="auth-confirm-password">
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Emergency SMS Opt-in Checkbox (Signup only) */}
            {mode === 'signup' && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 0.9rem',
                backgroundColor: 'var(--teal-50)',
                border: '1px solid var(--teal-200)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem'
              }}>
                <input
                  id="sms-optin"
                  type="checkbox"
                  checked={smsAlertsEnabled}
                  onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--teal-600)',
                    marginTop: '2px',
                    cursor: 'pointer'
                  }}
                />
                <label htmlFor="sms-optin" style={{ fontSize: '0.8rem', color: 'var(--teal-900)', cursor: 'pointer', lineHeight: 1.4 }}>
                  <strong>Enable Automated Mobile Alerts:</strong> Dispatch real-time emergency SMS notifications to my phone when critical contaminants or extreme threshold breaches are detected.
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.75rem',
                marginTop: '0.35rem',
                fontWeight: 700,
                fontSize: '0.92rem'
              }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? 'Sign In to Dashboard' : 'Register & Enable Telemetry'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Instant Dashboard Exploration Option */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              Want to test the live telemetry dashboard immediately?
            </p>
            <button
              type="button"
              onClick={handleBypass}
              className="btn-secondary btn-sm"
              style={{
                width: '100%',
                justifyContent: 'center',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-900)',
                borderColor: 'var(--teal-200)',
                fontWeight: 700,
                padding: '0.6rem 1rem'
              }}
            >
              <Sparkles size={14} color="#0d9488" />
              <span>Instant Dashboard Access (Bypass Email Verification)</span>
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.76rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="#0d9488" />
            <span>Secured via Supabase Auth &amp; PostgreSQL RLS Policies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
