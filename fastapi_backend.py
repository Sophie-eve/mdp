"""
IoT-Based Smart Water Quality Monitoring System - FastAPI Backend Gateway
College Project Reference Implementation

This FastAPI application provides:
1. Ingestion endpoint for ESP32 hardware telemetry nodes (/api/telemetry).
2. Server-side water quality safety threshold evaluation (TDS, pH, Turbidity, Temp).
3. Native SMS Alert Center API powered by Fast2SMS (via sms_service.py).
4. Automated SMS hazard dispatch on real sensor spikes, with state cooldowns.
5. Delivery history, wallet balance inspection, and rate-limited test messaging.
"""

from fastapi import FastAPI, HTTPException, Header, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import logging

# Load environment variables from .env if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sms_service import (
    sms_manager,
    Fast2SMSProvider,
    normalize_indian_phone,
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AquaSenseGateway")

app = FastAPI(
    title="AquaSense IoT Gateway & SMS Notification API",
    description="Backend service for IoT Water Quality Monitoring with native Fast2SMS integration",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite default is http://localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# PROJECT-DEFINED WATER SAFETY THRESHOLDS
# =====================================================================
# - TDS: WARNING > 500 ppm, CRITICAL > 2000 ppm
# - pH: WARNING outside 6.5 - 8.5, CRITICAL < 4.0 or > 10.5
# - Turbidity: WARNING > 1.0 NTU, CRITICAL > 5.0 NTU
# - Temperature: WARNING outside 10°C - 35°C
# CRITICAL takes priority over WARNING. Missing values evaluate to SENSOR ERROR.

def evaluate_water_status(tds: Optional[float], ph: Optional[float], turbidity: Optional[float], temp: Optional[float]) -> str:
    if tds is None or ph is None or turbidity is None or temp is None:
        return "SENSOR ERROR"

    statuses = []

    # TDS check
    if tds > 2000:
        statuses.append("CRITICAL")
    elif tds > 500:
        statuses.append("WARNING")
    else:
        statuses.append("SAFE")

    # pH check
    if ph < 4.0 or ph > 10.5:
        statuses.append("CRITICAL")
    elif ph < 6.5 or ph > 8.5:
        statuses.append("WARNING")
    else:
        statuses.append("SAFE")

    # Turbidity check
    if turbidity > 5.0:
        statuses.append("CRITICAL")
    elif turbidity > 1.0:
        statuses.append("WARNING")
    else:
        statuses.append("SAFE")

    # Temperature check
    if temp < 10.0 or temp > 35.0:
        statuses.append("WARNING")
    else:
        statuses.append("SAFE")

    if "CRITICAL" in statuses:
        return "CRITICAL"
    if "WARNING" in statuses:
        return "WARNING"
    return "SAFE"


# =====================================================================
# PYDANTIC DATA TRANSFER MODELS
# =====================================================================

class TelemetryPayload(BaseModel):
    device_id: str = Field(default="ESP32-NODE-01", description="Hardware node identifier")
    tds: Optional[float] = Field(None, description="Total Dissolved Solids in ppm")
    ph: Optional[float] = Field(None, description="pH level (0-14 scale)")
    turbidity: Optional[float] = Field(None, description="Turbidity in NTU")
    temp: Optional[float] = Field(None, description="Water temperature in °C")
    is_simulated: bool = Field(default=False, description="Whether reading is from hardware or simulated")


class SMSPreferencesPayload(BaseModel):
    phone_number: str = Field(..., description="10-digit Indian phone number (e.g. 9876543210 or +91 9876543210)")
    is_enabled: bool = Field(default=True, description="Enable or disable automated cellular SMS alerts")
    min_severity: str = Field(default="CRITICAL", description="Minimum severity to trigger SMS ('CRITICAL' or 'WARNING')")
    cooldown_minutes: int = Field(default=10, ge=1, le=120, description="Cooldown interval in minutes between duplicate SMS alerts")
    consent_given: bool = Field(default=True, description="Explicit recipient consent for water hazard SMS notifications")


class SMSTestPayload(BaseModel):
    phone_number: Optional[str] = Field(None, description="Optional override mobile number for testing")


# In-memory buffer for readings history
in_memory_readings: List[Dict[str, Any]] = [
    {
        "id": "init-1",
        "device_id": "ESP32-NODE-01",
        "tds": 240,
        "ph": 7.3,
        "turbidity": 0.8,
        "temp": 24.5,
        "status": "SAFE",
        "is_simulated": True,
        "recorded_at": datetime.now(timezone.utc).isoformat()
    }
]

DEVICE_API_KEY = os.getenv("DEVICE_API_KEY", "aquasense-secret-device-token")


def verify_device_token(x_device_token: Optional[str] = Header(None)):
    """Verifies that the telemetry payload originates from an authenticated ESP32 node if header supplied"""
    if x_device_token and x_device_token != DEVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized device token"
        )
    return True


# =====================================================================
# API ROUTES: SYSTEM & TELEMETRY
# =====================================================================

@app.get("/")
def root():
    status_info = sms_manager.get_status()
    return {
        "project": "IoT-Based Smart Water Quality Monitoring System",
        "status": "online",
        "version": "2.0.0",
        "sms_provider": status_info["provider_name"],
        "sms_configured": status_info["is_provider_configured"],
        "endpoints": [
            "/api/readings",
            "/api/readings/latest",
            "/api/telemetry",
            "/api/sms/status",
            "/api/sms/preferences",
            "/api/sms/test",
            "/api/sms/history"
        ]
    }


@app.get("/api/readings/latest")
def get_latest_reading():
    if not in_memory_readings:
        raise HTTPException(status_code=404, detail="No readings found")
    return in_memory_readings[-1]


@app.get("/api/readings")
def get_all_readings():
    return in_memory_readings


@app.post("/api/telemetry")
def ingest_telemetry(payload: TelemetryPayload, authenticated: bool = Depends(verify_device_token)):
    """
    Ingests sensor reading from ESP32 node or simulation engine.
    Evaluates status and triggers Fast2SMS dispatch if hazard criteria and cooldown pass.
    """
    calculated_status = evaluate_water_status(
        payload.tds, payload.ph, payload.turbidity, payload.temp
    )

    record = {
        "id": f"rec-{len(in_memory_readings) + 1}",
        "device_id": payload.device_id,
        "tds": payload.tds,
        "ph": payload.ph,
        "turbidity": payload.turbidity,
        "temp": payload.temp,
        "status": calculated_status,
        "is_simulated": payload.is_simulated,
        "recorded_at": datetime.now(timezone.utc).isoformat()
    }

    in_memory_readings.append(record)
    if len(in_memory_readings) > 100:
        in_memory_readings.pop(0)

    # Automated SMS evaluation on threshold breach
    sms_dispatch_result = None
    if calculated_status in ("CRITICAL", "WARNING"):
        sms_dispatch_result = sms_manager.evaluate_and_dispatch_alert(
            device_id=payload.device_id,
            overall_status=calculated_status,
            tds=payload.tds,
            ph=payload.ph,
            turbidity=payload.turbidity,
            temp=payload.temp,
        )

    return {
        "status": "success",
        "record": record,
        "sms_alert": sms_dispatch_result
    }


# =====================================================================
# API ROUTES: SMS ALERT CENTER
# =====================================================================

@app.get("/api/sms/status")
def get_sms_status():
    """
    Returns the truthful operational status of the SMS notification service:
    - Provider configuration status (whether FAST2SMS_API_KEY is present)
    - Fast2SMS wallet balance (if key is valid)
    - Current recipient mobile number
    - Alert enabled flag & cooldown remaining
    Never exposes API secrets.
    """
    return sms_manager.get_status()


@app.get("/api/sms/preferences")
def get_sms_preferences():
    """Returns the user's current SMS alert preferences"""
    return sms_manager.preferences


@app.post("/api/sms/preferences")
def update_sms_preferences(payload: SMSPreferencesPayload):
    """
    Saves recipient phone number, enabled toggle, minimum severity,
    cooldown interval, and recipient consent.
    """
    try:
        updated = sms_manager.update_preferences(
            phone_number=payload.phone_number,
            is_enabled=payload.is_enabled,
            min_severity=payload.min_severity,
            cooldown_minutes=payload.cooldown_minutes,
            consent_given=payload.consent_given,
        )
        return {
            "success": True,
            "message": "SMS alert preferences successfully saved.",
            "preferences": updated
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/sms/test")
def send_test_sms(payload: Optional[SMSTestPayload] = None):
    """
    Dispatches a real-time test SMS message to verify carrier delivery.
    Enforces a rate limit of max 3 tests per 10 minutes.
    """
    target = payload.phone_number if payload else None
    result = sms_manager.send_test_sms(target)
    if not result.get("success") and result.get("status") == "RATE_LIMITED":
        raise HTTPException(
            status_code=429,
            detail=result.get("error", "Rate limit exceeded. Please wait before requesting another test SMS.")
        )
    return result


@app.get("/api/sms/history")
def get_sms_delivery_history():
    """
    Returns the real delivery attempt history log (newest first).
    Returns genuine empty list if no attempts have been made yet.
    """
    return {
        "count": len(sms_manager.delivery_history),
        "history": sms_manager.delivery_history
    }


# Backwards compatibility with previous endpoint
@app.post("/api/alerts/test-sms")
def legacy_test_sms(payload: SMSTestPayload):
    return sms_manager.send_test_sms(payload.phone_number)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("fastapi_backend:app", host="0.0.0.0", port=8000, reload=True)
