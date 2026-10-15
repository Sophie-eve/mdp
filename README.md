# IoT-Based Smart Water Quality Monitoring System

A modern, responsive, full-stack IoT telemetry dashboard built with React, Vite, Supabase PostgreSQL, Supabase Auth, and Recharts. Designed for real-time water quality monitoring, threshold safety classification, and ESP32 telemetry hardware integration.

---

## 🌊 Overview & Core Features

- **Real-time Telemetry Dashboard**: Displays four primary water parameters:
  - **TDS (Total Dissolved Solids)** in `ppm`
  - **pH Level** (0–14 scale)
  - **Turbidity** in `NTU`
  - **Water Temperature** in `°C`
- **Dynamic Safety Thresholds & Priority Logic**:
  - **TDS**: WARNING > `500 ppm`, CRITICAL > `2000 ppm`
  - **pH**: WARNING outside `6.5 – 8.5`
  - **Turbidity**: WARNING > `1.0 NTU`, CRITICAL > `5.0 NTU`
  - **Temperature**: WARNING outside `10.0°C – 35.0°C`
  - **CRITICAL** strictly takes precedence over **WARNING**.
  - Missing/null sensor measurements evaluate to **SENSOR ERROR** (never marked SAFE).
  - Clear academic disclaimer: *"These project thresholds are for academic demonstration and monitoring indicators only; they do not certify that water is safe for human consumption."*
- **Overall Water Quality Classification**:
  - `SAFE` (Green badge & banner)
  - `WARNING` (Orange badge & banner)
  - `CRITICAL` (Red badge & banner)
  - `SENSOR ERROR` (Gray badge & banner)
- **Interactive Recharts Visualizations**:
  - Combined multi-metric historical trend chart with dual Y-axes
  - Dedicated metric views (TDS, pH, Turbidity, Temp) with safety threshold reference lines
- **Supabase Integration**:
  - Directly queries your existing `public.readings` table (`id`, `device_id`, `tds`, `ph`, `turbidity`, `temp`, `status`, `is_simulated`, `recorded_at`).
  - Preserves existing database rows (loads your 8 seeded readings without generating duplicate sample records).
  - Supabase Auth email/password authentication protecting the dashboard.
- **Alert Management Console**:
  - Real-time alert generation from telemetry violations.
  - Severity level (`CRITICAL` vs `WARNING`), triggering parameter, measured value, and timestamp.
  - Interactive acknowledgement tracking saved locally in browser storage.
- **Future Hardware & FastAPI Backend Pipeline**:
  - Python FastAPI reference gateway (`fastapi_backend.py`) for receiving HTTP telemetry from physical ESP32 Wi-Fi nodes and persisting to Supabase.
  - Data-access logic decoupled in reusable frontend service modules (`src/services/readingService.js`).

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend Framework | **React 18** + **Vite 6** (JavaScript) |
| Styling | **Modern CSS** (Off-white `#f6f8fa`, Teal `#0d9488`, subtle card shadows) |
| Iconography | **Lucide React** (`lucide-react`) |
| Data Visualizations | **Recharts** (`recharts`) |
| Database | **Supabase PostgreSQL** (`public.readings`) |
| Authentication | **Supabase Auth** (Email / Password) |
| Client SDK | `@supabase/supabase-js` |
| Future Hardware Backend | **Python 3** + **FastAPI** (`fastapi_backend.py`) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure you have **Node.js** (v18+ or v20+) installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Configuration
Create a `.env` file in the project root (you can copy `.env.example`):

```bash
# On Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` and fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-actual-supabase-publishable-key
```

> ⚠️ **Security Note**: Never expose Supabase service-role keys, database passwords, or secret tokens in the frontend `.env` file. Only use the **anon / publishable key**.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:3000`** (or the port reported by Vite).

---

## 🗄️ Supabase Database & Table Reference

The application interfaces directly with your existing Supabase table:

```sql
-- Schema of public.readings
CREATE TABLE IF NOT EXISTS public.readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  tds numeric,
  ph numeric,
  turbidity numeric,
  temp numeric,
  status text,
  is_simulated boolean DEFAULT true,
  recorded_at timestamptz DEFAULT now()
);

-- Recommended Row Level Security (RLS) Policy for least privilege:
ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view readings
CREATE POLICY "Allow authenticated read access"
  ON public.readings
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow public read access (if you want visitors to read telemetry without signing in)
-- CREATE POLICY "Allow anon read access" ON public.readings FOR SELECT TO anon USING (true);
```

---

## 🔐 Authentication & Testing Without Credentials

1. **With Supabase configured**:
   - Register a new account via the **"Create Account"** tab on the login screen.
   - Or log in with an existing user in your Supabase Auth user table.
   - Once authenticated, the dashboard immediately pulls your database readings from `public.readings`.

2. **Offline Preview Mode**:
   - If `.env` is not yet configured, the application detects this gracefully and presents a helpful **Configuration Notice** banner.
   - Click **"Launch Academic UI Preview"** on the login screen to explore the UI immediately using the 8 simulated preview readings matching your database schema.

---

## 📡 Future Hardware: ESP32 & Python FastAPI Integration

To run the optional Python FastAPI backend gateway:

1. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn pydantic
   ```
2. Run the gateway server:
   ```bash
   python fastapi_backend.py
   ```
   The API will listen at `http://localhost:8000`. ESP32 nodes can send telemetry via:
   ```http
   POST /api/telemetry
   Header: X-Device-Token: aquasense-secret-device-token
   Body:
   {
     "device_id": "ESP32-NODE-01",
     "tds": 245.0,
     "ph": 7.2,
     "turbidity": 0.8,
     "temp": 24.1,
     "is_simulated": false
   }
   ```
