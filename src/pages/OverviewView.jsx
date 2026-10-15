import React from 'react';
import { 
  Droplets, 
  Activity, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Building2, 
  Home, 
  Factory, 
  Fish, 
  Sprout, 
  Layers, 
  Server, 
  Send, 
  LogIn, 
  Sliders,
  ExternalLink,
  Flame,
  FlaskConical,
  Droplet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OverviewView({ onNavigate }) {
  const { user, isAuthenticated } = useAuth();

  const handleLaunchDashboard = () => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    } else {
      // If not logged in, prompt login or let them preview
      onNavigate('dashboard');
    }
  };

  const handleGoAuth = (mode = 'signup') => {
    onNavigate('auth');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Presentation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #042f2e 0%, #0f766e 50%, #0d9488 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '3rem 2.5rem',
        color: '#ffffff',
        boxShadow: '0 20px 40px -10px rgba(13, 148, 136, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.25) 0%, rgba(13, 148, 136, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '780px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <Sparkles size={14} color="#5eead4" />
            <span>IoT Smart Water Telemetry Platform</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            color: '#ffffff'
          }}>
            IoT-Based Smart Water Quality Monitoring System
          </h1>

          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '2rem',
            fontWeight: 400
          }}>
            An autonomous end-to-end telemetry system combining submerged physical sensors, an ESP32 edge microcontroller, Supabase PostgreSQL, and automated cellular SMS hazard notifications to protect public health and water ecosystems.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleLaunchDashboard}
              className="btn-primary"
              style={{
                backgroundColor: '#ffffff',
                color: '#0f766e',
                fontSize: '0.96rem',
                fontWeight: 800,
                padding: '0.85rem 1.6rem',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Activity size={18} />
              <span>Launch Live Simulation Dashboard</span>
              <ArrowRight size={16} />
            </button>

            {!isAuthenticated && (
              <button
                onClick={() => handleGoAuth('signup')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  padding: '0.85rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Smartphone size={16} />
                <span>Register Phone for SMS Alerts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: What is this Website & System All About? */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Droplets size={22} color="#0d9488" />
            <div>
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
                What is AquaSense All About?
              </h2>
              <p className="card-subtitle">
                Understanding the real-world problem and the IoT engineering solution
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b' }}>
                The Critical Problem: Delayed Lab Detection
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.6 }}>
              Conventional water safety monitoring relies on periodic manual bottle sampling and sending specimens to distant analytical laboratories. Titration and bacterial culturing typically take <strong>24 to 72 hours</strong>.
            </p>
            <p style={{ fontSize: '0.88rem', color: '#7f1d1d', lineHeight: 1.6, marginTop: '0.5rem' }}>
              By the time laboratory results report hazardous contamination, chemical runoffs or sewage leaks have already entered drinking distribution pipelines, putting thousands of lives at risk of severe waterborne diseases.
            </p>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f0fdfa',
            border: '1px solid #ccfbf1',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={20} color="#0d9488" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#115e59' }}>
                The Solution: Autonomous IoT Telemetry
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.6 }}>
              AquaSense places physical, submerged probes directly into water distribution points. An <strong>ESP32 microcontroller</strong> continuously samples physical and chemical indicators every second and pushes readings over Wi-Fi / HTTPS.
            </p>
            <p style={{ fontSize: '0.88rem', color: '#134e4a', lineHeight: 1.6, marginTop: '0.5rem' }}>
              If any parameter breaches project safety thresholds, an automated <strong>cellular SMS dispatch engine</strong> immediately sends emergency alert text messages directly to registered operators' mobile phones with zero manual delay.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Key Uses & Real-World Applications */}
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Key Uses &amp; Real-World Applications
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Where and how this smart IoT water monitoring platform is utilized
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {/* Use 1 */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Home size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Drinking Water &amp; RO Systems
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Continuous screening of residential overhead storage tanks, community RO water purification kiosks, and tap water supplies to ensure potable mineral safety and prevent membrane clogging.
            </p>
          </div>

          {/* Use 2 */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Building2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              College Campus Water Dispensers
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Installed directly inside student hostel coolers, university cafeterias, and academic blocks to provide real-time assurance that student drinking water meets health safety standards.
            </p>
          </div>

          {/* Use 3 */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fff7ed',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Factory size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Industrial Effluent Compliance
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Immediate detection of illegal chemical discharge, excessive dissolved solids, or acidic waste surges from manufacturing units before untreated effluent reaches public rivers and lakes.
            </p>
          </div>

          {/* Use 4 */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Fish size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Aquaculture &amp; Fish Hatcheries
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Maintaining optimal dissolved solids, neutral pH (6.5–8.5), and controlled temperature is vital for prawn hatcheries and sensitive fish farming ponds to prevent massive mortality.
            </p>
          </div>

          {/* Use 5 */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#fefce8',
              color: '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Sprout size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Borewells &amp; Agricultural Irrigation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Detecting agricultural pesticide runoff, heavy mineral leaching, and seasonal salinity intrusion in farm tube-wells to protect crop health and soil fertility.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: The 4 Core Sensor Probes */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Sliders size={22} color="#0d9488" />
            <div>
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
                The 4 Core Monitored Water Parameters
              </h2>
              <p className="card-subtitle">
                Project-defined safety thresholds, evaluation criteria, and health significance
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {/* Parameter 1: TDS */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <Flame size={18} color="#0d9488" />
              <span>TDS (Total Dissolved Solids)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Unit: <strong>parts per million (ppm)</strong>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Measures combined inorganic salts (calcium, magnesium, sodium) and organic matter dissolved in water.
            </p>
            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ color: '#059669', fontWeight: 700 }}>• SAFE: 0 – 500 ppm</div>
              <div style={{ color: '#d97706', fontWeight: 700 }}>• WARNING: &gt; 500 ppm</div>
              <div style={{ color: '#dc2626', fontWeight: 700 }}>• CRITICAL: &gt; 2000 ppm</div>
            </div>
          </div>

          {/* Parameter 2: pH */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <FlaskConical size={18} color="#0d9488" />
              <span>pH Level (Acidity / Alkalinity)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Scale: <strong>0 – 14 logarithmic</strong>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Measures hydrogen-ion concentration. Extreme acidity corrosive to pipes; alkaline water tastes bitter.
            </p>
            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ color: '#059669', fontWeight: 700 }}>• SAFE: 6.5 – 8.5 (Neutral)</div>
              <div style={{ color: '#d97706', fontWeight: 700 }}>• WARNING: Outside 6.5 – 8.5</div>
              <div style={{ color: '#dc2626', fontWeight: 700 }}>• CRITICAL: &lt; 4.0 or &gt; 10.5</div>
            </div>
          </div>

          {/* Parameter 3: Turbidity */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <Droplet size={18} color="#0d9488" />
              <span>Turbidity (Water Clarity)</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Unit: <strong>NTU (Nephelometric)</strong>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Measures cloudiness caused by suspended clay, silt, sewage particles, or microbial microorganisms.
            </p>
            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ color: '#059669', fontWeight: 700 }}>• SAFE: 0 – 1.0 NTU (Crystal Clear)</div>
              <div style={{ color: '#d97706', fontWeight: 700 }}>• WARNING: &gt; 1.0 NTU</div>
              <div style={{ color: '#dc2626', fontWeight: 700 }}>• CRITICAL: &gt; 5.0 NTU (Severe Haze)</div>
            </div>
          </div>

          {/* Parameter 4: Temperature */}
          <div style={{ padding: '1.25rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0d9488', fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>
              <Activity size={18} color="#0d9488" />
              <span>Water Temperature</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Unit: <strong>Celsius (°C)</strong>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              High temperature accelerates chemical dissolution and increases microbial growth rates.
            </p>
            <div style={{ fontSize: '0.76rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ color: '#059669', fontWeight: 700 }}>• SAFE: 10.0°C – 35.0°C</div>
              <div style={{ color: '#d97706', fontWeight: 700 }}>• WARNING: Outside 10°C – 35°C</div>
              <div style={{ color: '#64748b', fontWeight: 700 }}>• MISSING: Strictly SENSOR ERROR</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Architecture Pipeline */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <Layers size={22} color="#0d9488" />
            <div>
              <h2 className="card-title" style={{ fontSize: '1.25rem' }}>
                End-to-End System Architecture
              </h2>
              <p className="card-subtitle">
                From physical sensor probes to cloud PostgreSQL and mobile SMS delivery
              </p>
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          position: 'relative'
        }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Stage 1: Hardware Probes
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Analog Sensor Suite
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              TDS probe, pH electrode, optical turbidity photodiode, and DS18B20 digital thermometer submerged in water.
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Stage 2: Edge Computing
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              ESP32 Microcontroller
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Samples ADC voltages, applies calibration polynomials, and dispatches JSON telemetry packets via Wi-Fi.
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Stage 3: Cloud Database
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Supabase PostgreSQL
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Stores historical telemetry rows in <code>public.readings</code> with timestamps, device IDs, and status.
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Stage 4: Automated Alerts
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991b1b', marginBottom: '0.5rem' }}>
              Cellular SMS Dispatch
            </div>
            <p style={{ fontSize: '0.8rem', color: '#7f1d1d', lineHeight: 1.5 }}>
              Edge triggers dispatch emergency SMS messages to registered mobile phones (+91) via Twilio or Fast2SMS.
            </p>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal-700)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Stage 5: Live UI
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              React + Recharts
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Responsive web dashboard with real-time trendline charts, Brownian simulation, and contamination spike demos.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action bottom card */}
      <div style={{
        backgroundColor: 'var(--teal-50)',
        border: '1px solid var(--teal-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--teal-900)', marginBottom: '0.35rem' }}>
            Ready to explore the live simulation dashboard?
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--teal-800)', maxWidth: '600px', lineHeight: 1.5 }}>
            Sign in or create your account with your 10-digit mobile number (+91) to unlock real-time sensor streams, spike testing, and automated hazard alerts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('dashboard')}
            className="btn-primary"
            style={{ fontWeight: 800, padding: '0.75rem 1.4rem' }}
          >
            <Activity size={16} />
            <span>Open Live Dashboard</span>
          </button>

          {!isAuthenticated && (
            <button
              onClick={() => onNavigate('auth')}
              className="btn-secondary"
              style={{
                backgroundColor: '#ffffff',
                borderColor: 'var(--teal-300)',
                color: 'var(--teal-900)',
                fontWeight: 700,
                padding: '0.75rem 1.4rem'
              }}
            >
              <LogIn size={16} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
