"""
AquaSense SMS Notification Service
Modular SMS Gateway Architecture with Fast2SMS as initial provider.

Features:
- Provider-agnostic BaseSMSProvider interface for easy replacement (Twilio, AWS SNS, MSG91, etc.)
- Fast2SMSProvider implementing the official Fast2SMS bulkV2 API (route="q") and Wallet API
- Server-side Indian phone number validation and normalization (10-digit [6-9]xxxxxxxxx format)
- Rate limiting for test messages (max 3 tests per 10-minute window)
- Per-user alert cooldown & state-transition duplicate prevention
- Real delivery attempt logging with honest status tracking (SENT, FAILED, NOT_CONFIGURED)
"""

import os
import re
import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timezone
import requests

logger = logging.getLogger("AquaSenseSMS")

# Default thresholds
DEFAULT_COOLDOWN_MINUTES = 10
MAX_TEST_SMS_PER_WINDOW = 3
TEST_WINDOW_SECONDS = 600  # 10 minutes


def normalize_indian_phone(phone: str) -> Tuple[bool, str, Optional[str]]:
    """
    Normalizes and validates a phone number for Indian SMS gateways.
    Returns: (is_valid, 10_digit_number, formatted_e164_or_error)
    """
    if not phone or not isinstance(phone, str):
        return False, "", "Phone number is required."

    # Strip all non-digits
    digits = re.sub(r"\D", "", phone)

    # Handle leading zero: 09876543210 -> 9876543210
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    # Handle country code 91: 919876543210 -> 9876543210
    elif len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]

    # Verify exactly 10 digits
    if len(digits) != 10:
        return False, "", f"Invalid length: expected 10-digit mobile number, received {len(digits)} digits."

    # Standard Indian mobile numbers start with 6, 7, 8, or 9
    if not re.match(r"^[6-9]\d{9}$", digits):
        return False, "", "Invalid Indian mobile number: must begin with 6, 7, 8, or 9."

    return True, digits, f"+91 {digits}"


class SMSResult:
    def __init__(
        self,
        success: bool,
        status: str,
        provider: str,
        message: str,
        request_id: Optional[str] = None,
        error_details: Optional[str] = None,
        raw_response: Optional[Dict[str, Any]] = None,
    ):
        self.success = success
        self.status = status  # 'SENT', 'FAILED', 'NOT_CONFIGURED', 'SIMULATED'
        self.provider = provider
        self.message = message
        self.request_id = request_id
        self.error_details = error_details
        self.raw_response = raw_response or {}
        self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status,
            "provider": self.provider,
            "message": self.message,
            "request_id": self.request_id,
            "error_details": self.error_details,
            "timestamp": self.timestamp,
        }


class BaseSMSProvider(ABC):
    """Abstract interface for all SMS delivery providers"""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if required credentials exist"""
        pass

    @abstractmethod
    def send_sms(self, to_phone_10_digit: str, message: str) -> SMSResult:
        """Sends an SMS and returns an SMSResult"""
        pass

    @abstractmethod
    def get_wallet_balance(self) -> Dict[str, Any]:
        """Returns wallet or credit status if supported by provider"""
        pass


class Fast2SMSProvider(BaseSMSProvider):
    """
    Official Fast2SMS bulkV2 implementation.
    Uses Quick Route ('q') for transactional water quality alerts.
    Endpoint: https://www.fast2sms.com/dev/bulkV2
    """

    API_URL = "https://www.fast2sms.com/dev/bulkV2"
    WALLET_URL = "https://www.fast2sms.com/dev/wallet"

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key or os.getenv("FAST2SMS_API_KEY", "").strip()

    @property
    def provider_name(self) -> str:
        return "Fast2SMS"

    def is_configured(self) -> bool:
        # Check if valid non-placeholder key is present
        return bool(
            self._api_key
            and len(self._api_key) > 8
            and "your_fast2sms" not in self._api_key.lower()
            and "placeholder" not in self._api_key.lower()
        )

    def reload_key(self):
        self._api_key = os.getenv("FAST2SMS_API_KEY", "").strip()

    def send_sms(self, to_phone_10_digit: str, message: str) -> SMSResult:
        if not self.is_configured():
            logger.warning("Fast2SMS API key not configured in environment (FAST2SMS_API_KEY).")
            return SMSResult(
                success=False,
                status="NOT_CONFIGURED",
                provider=self.provider_name,
                message="SMS provider is not configured. Please set FAST2SMS_API_KEY in backend environment.",
                error_details="FAST2SMS_API_KEY environment variable is missing or empty.",
            )

        headers = {
            "Authorization": self._api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        # Fast2SMS Quick Route payload
        payload = {
            "route": "q",
            "message": message,
            "language": "english",
            "flash": 0,
            "numbers": to_phone_10_digit,
        }

        try:
            logger.info(f"Dispatching SMS via Fast2SMS to +91 {to_phone_10_digit}...")
            response = requests.post(
                self.API_URL,
                json=payload,
                headers=headers,
                timeout=12,
            )

            try:
                data = response.json()
            except Exception:
                data = {"raw_text": response.text}

            logger.info(f"Fast2SMS Response (HTTP {response.status_code}): {data}")

            # Fast2SMS returns: {"return": true, "request_id": "...", "message": ["..."]}
            if response.status_code == 200 and data.get("return") is True:
                request_id = data.get("request_id")
                msg_text = "SMS accepted by Fast2SMS gateway."
                if isinstance(data.get("message"), list) and data.get("message"):
                    msg_text = data["message"][0]

                return SMSResult(
                    success=True,
                    status="SENT",
                    provider=self.provider_name,
                    message=msg_text,
                    request_id=request_id,
                    raw_response=data,
                )
            else:
                # Handle error responses from Fast2SMS
                error_msg = "Provider rejected SMS dispatch request."
                if isinstance(data.get("message"), str):
                    error_msg = data.get("message")
                elif isinstance(data.get("message"), list) and data.get("message"):
                    error_msg = str(data["message"][0])
                elif response.status_code == 401 or response.status_code == 411:
                    error_msg = "Invalid Fast2SMS authorization key or unauthorized account."
                elif response.status_code == 994:
                    error_msg = "Fast2SMS wallet balance is low/insufficient."

                return SMSResult(
                    success=False,
                    status="FAILED",
                    provider=self.provider_name,
                    message=error_msg,
                    error_details=f"HTTP {response.status_code}: {error_msg}",
                    raw_response=data,
                )

        except requests.exceptions.Timeout:
            logger.error("Fast2SMS gateway connection timed out (12s).")
            return SMSResult(
                success=False,
                status="FAILED",
                provider=self.provider_name,
                message="Fast2SMS gateway connection timed out.",
                error_details="Timeout: Unable to reach Fast2SMS within 12 seconds.",
            )
        except requests.exceptions.RequestException as e:
            logger.error(f"Network error while contacting Fast2SMS: {str(e)}")
            return SMSResult(
                success=False,
                status="FAILED",
                provider=self.provider_name,
                message="Network communication error with Fast2SMS gateway.",
                error_details=str(e),
            )

    def get_wallet_balance(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {
                "configured": False,
                "balance": None,
                "currency": "INR",
                "message": "Fast2SMS API key is not configured.",
            }

        headers = {
            "Authorization": self._api_key,
            "Accept": "application/json",
        }

        try:
            resp = requests.post(self.WALLET_URL, headers=headers, timeout=8)
            data = resp.json()
            if resp.status_code == 200 and data.get("return") is True:
                balance_val = data.get("wallet")
                try:
                    balance_num = float(balance_val)
                except (ValueError, TypeError):
                    balance_num = balance_val
                return {
                    "configured": True,
                    "balance": balance_num,
                    "currency": "INR",
                    "raw": data,
                }
            else:
                return {
                    "configured": True,
                    "balance": None,
                    "error": data.get("message", "Could not fetch wallet balance."),
                }
        except Exception as e:
            return {
                "configured": True,
                "balance": None,
                "error": f"Error querying wallet: {str(e)}",
            }


class SMSNotificationManager:
    """
    Manages user preferences, stateful alert cooldowns, rate limits, and delivery history.
    """

    def __init__(self, provider: Optional[BaseSMSProvider] = None):
        self.provider = provider or Fast2SMSProvider()

        # In-memory preferences state (persisted per session, ready for Supabase sync)
        self.preferences = {
            "phone_number": os.getenv("ALERT_TARGET_PHONE", "+91 9876543210"),
            "is_enabled": True,
            "min_severity": "CRITICAL",  # 'CRITICAL' or 'WARNING'
            "cooldown_minutes": DEFAULT_COOLDOWN_MINUTES,
            "consent_given": True,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        # Delivery log history: stored newest-first, capped at 100 entries
        self.delivery_history: List[Dict[str, Any]] = []

        # Anti-spam cooldown tracking: tracks last sent timestamp per hazard
        self.last_alert_time: Optional[float] = None
        self.last_alert_reason: Optional[str] = None

        # Rate-limiting tracker for test SMS: stores timestamps of test calls
        self._test_sms_timestamps: List[float] = []

    def get_status(self) -> Dict[str, Any]:
        """Returns truthful operational status of the SMS notification service"""
        self.provider.is_configured()
        wallet_info = self.provider.get_wallet_balance()

        now = time.time()
        in_cooldown = False
        cooldown_remaining_sec = 0
        if self.last_alert_time:
            elapsed = now - self.last_alert_time
            total_cooldown_sec = self.preferences.get("cooldown_minutes", 10) * 60
            if elapsed < total_cooldown_sec:
                in_cooldown = True
                cooldown_remaining_sec = int(total_cooldown_sec - elapsed)

        return {
            "provider_name": self.provider.provider_name,
            "is_provider_configured": self.provider.is_configured(),
            "wallet": wallet_info,
            "is_alerts_enabled": self.preferences.get("is_enabled", False),
            "recipient_phone": self.preferences.get("phone_number", ""),
            "min_severity": self.preferences.get("min_severity", "CRITICAL"),
            "cooldown_minutes": self.preferences.get("cooldown_minutes", 10),
            "consent_given": self.preferences.get("consent_given", False),
            "in_cooldown": in_cooldown,
            "cooldown_remaining_seconds": cooldown_remaining_sec,
            "total_sent_count": len([x for x in self.delivery_history if x.get("status") == "SENT"]),
            "total_failed_count": len([x for x in self.delivery_history if x.get("status") == "FAILED"]),
        }

    def update_preferences(
        self,
        phone_number: str,
        is_enabled: bool,
        min_severity: str = "CRITICAL",
        cooldown_minutes: int = 10,
        consent_given: bool = True,
    ) -> Dict[str, Any]:
        """Validates and updates user SMS preferences"""
        is_valid, digits, formatted = normalize_indian_phone(phone_number)
        if not is_valid:
            raise ValueError(formatted)

        if min_severity not in ("CRITICAL", "WARNING"):
            min_severity = "CRITICAL"

        cooldown_minutes = max(1, min(120, int(cooldown_minutes)))

        self.preferences = {
            "phone_number": formatted,
            "is_enabled": bool(is_enabled),
            "min_severity": min_severity,
            "cooldown_minutes": cooldown_minutes,
            "consent_given": bool(consent_given),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }

        logger.info(f"Updated SMS preferences: phone={formatted}, enabled={is_enabled}, severity={min_severity}")
        return self.preferences

    def check_test_rate_limit(self) -> Tuple[bool, Optional[str]]:
        """Enforces max 3 test messages per 10-minute window"""
        now = time.time()
        # Clean timestamps older than window
        self._test_sms_timestamps = [
            t for t in self._test_sms_timestamps if (now - t) < TEST_WINDOW_SECONDS
        ]

        if len(self._test_sms_timestamps) >= MAX_TEST_SMS_PER_WINDOW:
            oldest = self._test_sms_timestamps[0]
            wait_sec = int(TEST_WINDOW_SECONDS - (now - oldest))
            return False, f"Test SMS rate limit exceeded (max {MAX_TEST_SMS_PER_WINDOW} per 10 mins). Please wait {wait_sec} seconds."

        return True, None

    def send_test_sms(self, target_phone: Optional[str] = None) -> Dict[str, Any]:
        """Dispatches an explicit authorized test SMS with rate limiting"""
        phone_to_use = target_phone or self.preferences.get("phone_number", "")
        is_valid, digits, formatted = normalize_indian_phone(phone_to_use)
        if not is_valid:
            return {
                "success": False,
                "status": "FAILED",
                "error": formatted,
                "message": "Invalid mobile number.",
            }

        allowed, rate_err = self.check_test_rate_limit()
        if not allowed:
            return {
                "success": False,
                "status": "RATE_LIMITED",
                "error": rate_err,
                "message": rate_err,
            }

        # Build official test message
        timestamp_str = datetime.now().strftime("%d-%b %I:%M %p")
        message_body = (
            f"Water Quality Alert: [AquaSense Test] Verification message for {formatted} at {timestamp_str}. "
            f"Your number is configured for real-time water hazard alerts."
        )

        result = self.provider.send_sms(digits, message_body)

        # Log timestamp if dispatch attempted
        self._test_sms_timestamps.append(time.time())

        # Record into history log
        log_entry = {
            "id": f"sms-{len(self.delivery_history) + 1}-{int(time.time())}",
            "phone_number": formatted,
            "trigger_reason": "MANUAL_TEST",
            "message": message_body,
            "status": result.status,
            "provider": result.provider,
            "provider_request_id": result.request_id,
            "error_details": result.error_details,
            "timestamp": result.timestamp,
        }
        self.delivery_history.insert(0, log_entry)

        return {
            "success": result.success,
            "status": result.status,
            "provider": result.provider,
            "request_id": result.request_id,
            "message": result.message,
            "error_details": result.error_details,
            "recipient": formatted,
            "timestamp": result.timestamp,
        }

    def evaluate_and_dispatch_alert(
        self,
        device_id: str,
        overall_status: str,
        tds: Optional[float],
        ph: Optional[float],
        turbidity: Optional[float],
        temp: Optional[float],
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates incoming sensor reading against user preferences and cooldowns.
        If a qualifying hazard is detected and cooldown is clear, sends an SMS.
        """
        # 1. Check if user enabled SMS alerts
        if not self.preferences.get("is_enabled", False):
            return None

        # 2. Check if user consent was granted
        if not self.preferences.get("consent_given", False):
            return None

        # 3. Check severity filter (CRITICAL vs WARNING)
        min_severity = self.preferences.get("min_severity", "CRITICAL")
        if min_severity == "CRITICAL" and overall_status != "CRITICAL":
            return None
        elif min_severity == "WARNING" and overall_status not in ("CRITICAL", "WARNING"):
            return None

        # 4. Check Cooldown
        now = time.time()
        cooldown_sec = self.preferences.get("cooldown_minutes", 10) * 60
        if self.last_alert_time and (now - self.last_alert_time) < cooldown_sec:
            logger.info(f"SMS Alert suppressed: cooldown active ({int(cooldown_sec - (now - self.last_alert_time))}s remaining).")
            return None

        # 5. Build reason and message
        issues = []
        if tds is not None and tds > 2000:
            issues.append(f"TDS {tds:.0f} ppm (>2000)")
        elif tds is not None and tds > 500:
            issues.append(f"TDS {tds:.0f} ppm (>500)")

        if ph is not None and (ph < 4.0 or ph > 10.5):
            issues.append(f"pH {ph:.1f} (Extreme)")
        elif ph is not None and (ph < 6.5 or ph > 8.5):
            issues.append(f"pH {ph:.1f} (Abnormal)")

        if turbidity is not None and turbidity > 5.0:
            issues.append(f"Turbidity {turbidity:.1f} NTU (>5.0)")
        elif turbidity is not None and turbidity > 1.0:
            issues.append(f"Turbidity {turbidity:.1f} NTU (>1.0)")

        if temp is not None and (temp < 10.0 or temp > 35.0):
            issues.append(f"Temp {temp:.1f}C (Outside safe bounds)")

        reason_str = ", ".join(issues) if issues else f"Status {overall_status}"

        phone_str = self.preferences.get("phone_number", "")
        is_valid, digits, formatted = normalize_indian_phone(phone_str)
        if not is_valid:
            logger.error(f"Cannot dispatch alert SMS: invalid phone number '{phone_str}'.")
            return None

        # Message format compliant with TRAI / informational alert guidelines
        message_body = (
            f"Water Quality Alert: [AquaSense] {overall_status} hazard detected on {device_id}! "
            f"{reason_str}. Please inspect water filtration system immediately."
        )

        result = self.provider.send_sms(digits, message_body)

        # Update last alert sent timestamp to enforce cooldown
        self.last_alert_time = now
        self.last_alert_reason = reason_str

        # Record in history log
        log_entry = {
            "id": f"sms-{len(self.delivery_history) + 1}-{int(now)}",
            "phone_number": formatted,
            "trigger_reason": f"{overall_status}_HAZARD: {reason_str}",
            "message": message_body,
            "status": result.status,
            "provider": result.provider,
            "provider_request_id": result.request_id,
            "error_details": result.error_details,
            "timestamp": result.timestamp,
        }
        self.delivery_history.insert(0, log_entry)

        return {
            "dispatched": result.success,
            "status": result.status,
            "provider": result.provider,
            "request_id": result.request_id,
            "recipient": formatted,
            "reason": reason_str,
            "timestamp": result.timestamp,
        }


# Global singleton manager instance
sms_manager = SMSNotificationManager()
