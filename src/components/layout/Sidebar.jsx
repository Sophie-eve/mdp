import { 
  LayoutDashboard, 
  Activity, 
  History, 
  BarChart3, 
  AlertTriangle, 
  Cpu, 
  BellRing, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Droplets,
  X,
  Radio,
  LogIn,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen 
}) {
  const { unacknowledgedAlertsCount } = useData();
  const { user } = useAuth();

  const navigationItems = [
    { id: 'overview', label: 'Project Overview', icon: BookOpen },
    { id: 'dashboard', label: 'Live Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'history', label: 'Reading History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: AlertTriangle, 
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : null 
    },
    { id: 'sms', label: 'SMS Alert Center', icon: MessageSquare },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'settings', label: 'Notification Settings', icon: BellRing },
    ...(user ? [
      { id: 'profile', label: 'Profile & Alerts', icon: User }
    ] : [
      { id: 'auth', label: 'Sign In / Register', icon: LogIn }
    ]),
  ];

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="modal-backdrop"
          style={{ zIndex: 95 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon-wrapper">
              <Droplets size={22} />
            </div>
            {!isCollapsed && (
              <div className="brand-title-wrap">
                <span className="brand-title">AquaSense</span>
                <span className="brand-subtitle">IoT Water Quality</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Desktop collapse button */}
            <button 
              className="sidebar-toggle-btn desktop-only"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ display: isMobileOpen ? 'none' : 'flex' }}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            {/* Mobile close button */}
            {isMobileOpen && (
              <button 
                className="sidebar-toggle-btn"
                onClick={() => setIsMobileOpen(false)}
                title="Close navigation"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {isCollapsed && item.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="system-status-indicator">
              <Radio size={14} color="#0d9488" className="pulse-dot" />
              <span style={{ fontWeight: 600 }}>ESP32 Node Ready</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
