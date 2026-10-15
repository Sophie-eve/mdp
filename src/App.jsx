import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import AuthView from './components/auth/AuthView';
import OverviewView from './pages/OverviewView';
import DashboardView from './pages/DashboardView';
import LiveMonitoringView from './pages/LiveMonitoringView';
import ReadingHistoryView from './pages/ReadingHistoryView';
import AnalyticsView from './pages/AnalyticsView';
import AlertsView from './pages/AlertsView';
import DevicesView from './pages/DevicesView';
import NotificationSettingsView from './pages/NotificationSettingsView';
import ProfileView from './pages/ProfileView';
import SMSAlertCenterView from './pages/SMSAlertCenterView';
import EmergencySmsModal from './components/common/EmergencySmsModal';

function MainAppShell() {
  const { isAuthenticated, loading } = useAuth();
  // Unauthenticated visitors start on Project Overview; authenticated users go to Live Dashboard
  const [currentTab, setCurrentTab] = useState(isAuthenticated ? 'dashboard' : 'overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Automatically transition to live simulation dashboard once user authenticates
  useEffect(() => {
    if (isAuthenticated && (currentTab === 'overview' || currentTab === 'auth')) {
      setCurrentTab('dashboard');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--teal-200)',
          borderTopColor: 'var(--teal-600)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Loading AquaSense telemetry environment...
        </span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Dedicated full-screen Auth screen if current tab is auth
  if (currentTab === 'auth') {
    return (
      <AuthView 
        onBackToDashboard={() => setCurrentTab('dashboard')} 
      />
    );
  }

  const titles = {
    overview: { title: 'Project Overview & Technical Uses', subtitle: 'Understanding the IoT water monitoring architecture, sensors and real-world applications' },
    dashboard: { title: 'Live Water Quality Dashboard', subtitle: 'Real-time telemetry and safety threshold analysis' },
    live: { title: 'Live Sensor Telemetry', subtitle: 'Direct data stream from ESP32 node and probe readings' },
    history: { title: 'Reading History Log', subtitle: 'Historical database telemetry from public.readings' },
    analytics: { title: 'Water Quality Analytics', subtitle: 'Statistical distributions, averages and safety ratios' },
    alerts: { title: 'Threshold Alerts & Hazards', subtitle: 'Triggered water quality deviations and status log' },
    sms: { title: 'SMS Alert Center', subtitle: 'Cellular emergency notifications powered by Fast2SMS gateway' },
    devices: { title: 'Hardware Node Registry', subtitle: 'ESP32 microcontroller pinout and telemetry specs' },
    settings: { title: 'Alert Preferences & Thresholds', subtitle: 'Configure client notifications and project safety boundaries' },
    profile: { title: 'Project & Researcher Profile', subtitle: 'Supabase authentication details and college project metadata' },
  };

  const currentInfo = titles[currentTab] || titles.dashboard;

  const renderContent = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'live':
        return <LiveMonitoringView />;
      case 'history':
        return <ReadingHistoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'alerts':
        return <AlertsView />;
      case 'sms':
        return <SMSAlertCenterView />;
      case 'devices':
        return <DevicesView />;
      case 'settings':
        return <NotificationSettingsView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Floating Emergency SMS Dispatch Modal on spikes */}
      <EmergencySmsModal onNavigate={(tab) => setCurrentTab(tab)} />

      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div 
        className="main-wrapper"
        style={{
          marginLeft: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        }}
      >
        <Header
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        <main className="content-body">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainAppShell />
      </DataProvider>
    </AuthProvider>
  );
}
