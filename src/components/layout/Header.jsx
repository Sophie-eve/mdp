import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Database, 
  Cpu, 
  RefreshCw, 
  User, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Sparkles, 
  Radio,
  LogIn,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export default function Header({ 
  onMenuToggle, 
  title = 'Dashboard', 
  subtitle = 'Real-time telemetry and safety threshold analysis',
  onSelectTab
}) {
  const { user, logout, isConfigured, isGuestPreview, isAuthenticated } = useAuth();
  const { isSimulated, deviceStatus, lastSyncTime, refreshDatabase, loading, isStale, dataSourceMode } = useData();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLastSync = (date) => {
    if (!date) return 'Not synced';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getInitials = () => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return user.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return 'US';
  };

  const displayName = user?.full_name || (user?.email ? user.email.split('@')[0] : 'Guest');

  return (
    <header className="top-header">
      <div className="header-left">
        <button 
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          title="Open menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-page-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* Device Connection Status */}
        <div 
          className={`status-pill ${isStale ? 'unconfigured' : deviceStatus === 'ONLINE' ? 'device-online' : 'unconfigured'}`}
          title={`Node Status: ${deviceStatus}`}
        >
          <span className="pulse-dot" style={{ backgroundColor: isStale ? '#ea580c' : deviceStatus === 'ONLINE' ? '#0d9488' : '#eab308' }}></span>
          <span className="desktop-only" style={{ fontSize: '0.78rem' }}>
            {isStale ? 'Hardware Stale' : deviceStatus === 'ONLINE' ? 'Node Active' : 'Node Standby'}
          </span>
        </div>

        {/* Real vs Simulated Indicator */}
        <div 
          className={`status-pill ${isSimulated ? 'simulated' : 'connected'}`}
          title={isSimulated ? 'Values are deterministic simulated measurements' : 'Connected to live hardware'}
        >
          <Sparkles size={13} />
          <span style={{ fontSize: '0.78rem' }}>
            {isSimulated ? 'DEMO MODE' : 'HARDWARE'}
          </span>
        </div>

        {/* Database Connection Status */}
        <div 
          className={`status-pill ${isConfigured ? 'connected' : 'unconfigured'}`}
          title={isConfigured ? 'Connected to Supabase PostgreSQL' : 'Local preview dataset active'}
        >
          <Database size={13} />
          <span className="desktop-only" style={{ fontSize: '0.78rem' }}>
            {isConfigured ? 'Supabase Connected' : 'Preview Mode'}
          </span>
        </div>

        {/* Sync Refresh Button */}
        <button 
          className="btn-secondary btn-sm"
          onClick={refreshDatabase}
          disabled={loading}
          title={`Last sync: ${formatLastSync(lastSyncTime)}`}
          style={{ padding: '0.4rem 0.65rem' }}
        >
          <RefreshCw size={14} className={loading ? 'pulse-dot' : ''} />
          <span className="desktop-only" style={{ fontSize: '0.75rem' }}>
            {formatLastSync(lastSyncTime)}
          </span>
        </button>

        {/* Profile Menu or Sign In Button */}
        {user ? (
          <div className="profile-menu-container" ref={dropdownRef}>
            <button 
              className="profile-trigger-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
            >
              <div className="profile-avatar">
                {getInitials()}
              </div>
              <span className="profile-name desktop-only" style={{ fontWeight: 600 }}>
                {displayName}
              </span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    {user?.full_name || displayName}
                  </div>
                  <div className="dropdown-user-email">{user?.email || 'User Account'}</div>
                  {user?.phone_number && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--teal-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <Smartphone size={12} />
                      <span>{user.phone_number}</span>
                    </div>
                  )}
                  <div className="dropdown-user-role" style={{ marginTop: '0.35rem' }}>
                    Active Telemetry Monitor
                  </div>
                </div>

                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab?.('profile');
                  }}
                >
                  <User size={15} />
                  <span>My Profile &amp; Alert Settings</span>
                </button>

                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab?.('sms');
                  }}
                >
                  <Smartphone size={15} />
                  <span>SMS Alert Center</span>
                </button>

                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onSelectTab?.('settings');
                  }}
                >
                  <Radio size={15} />
                  <span>Notification Settings</span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.35rem 0' }} />

                <button 
                  className="dropdown-item danger"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="btn-primary btn-sm"
            onClick={() => onSelectTab?.('auth')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.85rem',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
