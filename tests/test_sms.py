"""
Unit Tests for AquaSense SMS Notification System
Tests Fast2SMSProvider, phone normalization, preferences, rate limits, and alert cooldowns.
Run with: pytest tests/test_sms.py -v
"""

import pytest
import os
import time
from unittest.mock import patch, MagicMock
from sms_service import (
    normalize_indian_phone,
    Fast2SMSProvider,
    SMSNotificationManager,
    SMSResult,
)


class TestPhoneNormalization:
    """Tests for Indian phone number normalization and validation"""

    def test_valid_10_digit_numbers(self):
        valid, digits, formatted = normalize_indian_phone("9876543210")
        assert valid is True
        assert digits == "9876543210"
        assert formatted == "+91 9876543210"

    def test_valid_with_plus_91_prefix(self):
        valid, digits, formatted = normalize_indian_phone("+91 98765 43210")
        assert valid is True
        assert digits == "9876543210"

    def test_valid_with_leading_zero(self):
        valid, digits, formatted = normalize_indian_phone("09876543210")
        assert valid is True
        assert digits == "9876543210"

    def test_valid_starting_digits(self):
        # Indian mobile numbers can start with 6, 7, 8, or 9
        for start in ["6", "7", "8", "9"]:
            num = f"{start}123456789"
            valid, digits, _ = normalize_indian_phone(num)
            assert valid is True, f"Failed for start digit {start}"

    def test_invalid_length_too_short(self):
        valid, digits, err = normalize_indian_phone("987654321")
        assert valid is False
        assert "Invalid length" in err

    def test_invalid_length_too_long(self):
        valid, digits, err = normalize_indian_phone("987654321012")
        assert valid is False
        assert "Invalid length" in err

    def test_invalid_starting_digit(self):
        # 1, 2, 3, 4, 5 are not valid starting digits for Indian mobile numbers
        valid, digits, err = normalize_indian_phone("1234567890")
        assert valid is False
        assert "must begin with 6, 7, 8, or 9" in err

    def test_empty_or_none(self):
        valid, _, err = normalize_indian_phone("")
        assert valid is False
        valid, _, err = normalize_indian_phone(None)
        assert valid is False


class TestFast2SMSProvider:
    """Tests for Fast2SMS API provider integration"""

    def test_missing_api_key(self):
        provider = Fast2SMSProvider(api_key="")
        assert provider.is_configured() is False
        result = provider.send_sms("9876543210", "Test message")
        assert result.success is False
        assert result.status == "NOT_CONFIGURED"
        assert "not configured" in result.message.lower()

    @patch("requests.post")
    def test_successful_sms_dispatch(self, mock_post):
        # Mock Fast2SMS success response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "return": True,
            "request_id": "test_req_abc123",
            "message": ["SMS sent successfully."],
        }
        mock_post.return_value = mock_response

        provider = Fast2SMSProvider(api_key="real_mock_api_key_12345")
        result = provider.send_sms("9876543210", "Water Quality Alert: TDS 2200 ppm")

        assert result.success is True
        assert result.status == "SENT"
        assert result.request_id == "test_req_abc123"
        assert mock_post.called

        # Verify correct Fast2SMS endpoint and payload
        args, kwargs = mock_post.call_args
        assert args[0] == "https://www.fast2sms.com/dev/bulkV2"
        assert kwargs["json"]["route"] == "q"
        assert kwargs["json"]["numbers"] == "9876543210"
        assert kwargs["headers"]["Authorization"] == "real_mock_api_key_12345"

    @patch("requests.post")
    def test_provider_rejected_response(self, mock_post):
        # Mock Fast2SMS error response (e.g. low balance or invalid authorization)
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {
            "return": False,
            "status_code": 994,
            "message": "Wallet balance is low",
        }
        mock_post.return_value = mock_response

        provider = Fast2SMSProvider(api_key="mock_key_with_zero_balance")
        result = provider.send_sms("9876543210", "Water Quality Alert")

        assert result.success is False
        assert result.status == "FAILED"
        assert "Wallet balance is low" in result.message

    @patch("requests.post")
    def test_provider_timeout_handling(self, mock_post):
        import requests
        mock_post.side_effect = requests.exceptions.Timeout("Connection timed out")

        provider = Fast2SMSProvider(api_key="mock_key_testing_timeout")
        result = provider.send_sms("9876543210", "Water Quality Alert")

        assert result.success is False
        assert result.status == "FAILED"
        assert "timed out" in result.message.lower()

    @patch("requests.post")
    def test_wallet_balance_check(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "return": True,
            "wallet": "350.50",
        }
        mock_post.return_value = mock_response

        provider = Fast2SMSProvider(api_key="valid_key")
        res = provider.get_wallet_balance()

        assert res["configured"] is True
        assert res["balance"] == 350.50


class TestSMSNotificationManager:
    """Tests for user preferences, test rate limiting, and alert cooldowns"""

    def test_update_preferences(self):
        manager = SMSNotificationManager(provider=Fast2SMSProvider(api_key="test_key"))
        updated = manager.update_preferences(
            phone_number="9876543210",
            is_enabled=True,
            min_severity="CRITICAL",
            cooldown_minutes=15,
            consent_given=True,
        )
        assert updated["phone_number"] == "+91 9876543210"
        assert updated["is_enabled"] is True
        assert updated["cooldown_minutes"] == 15

    def test_test_sms_rate_limiting(self):
        manager = SMSNotificationManager(provider=Fast2SMSProvider(api_key="test_key"))
        manager.preferences["phone_number"] = "+91 9876543210"

        # Mock provider send_sms to always succeed
        manager.provider.send_sms = MagicMock(return_value=SMSResult(
            success=True, status="SENT", provider="Fast2SMS", message="Sent", request_id="req1"
        ))

        # First 3 test messages should succeed
        res1 = manager.send_test_sms()
        assert res1["success"] is True

        res2 = manager.send_test_sms()
        assert res2["success"] is True

        res3 = manager.send_test_sms()
        assert res3["success"] is True

        # 4th test message must be rate limited!
        res4 = manager.send_test_sms()
        assert res4["success"] is False
        assert res4["status"] == "RATE_LIMITED"
        assert "rate limit exceeded" in res4["message"].lower()

    def test_duplicate_alert_cooldown(self):
        manager = SMSNotificationManager(provider=Fast2SMSProvider(api_key="test_key"))
        manager.preferences["phone_number"] = "+91 9876543210"
        manager.preferences["is_enabled"] = True
        manager.preferences["consent_given"] = True
        manager.preferences["cooldown_minutes"] = 10  # 10 min cooldown

        manager.provider.send_sms = MagicMock(return_value=SMSResult(
            success=True, status="SENT", provider="Fast2SMS", message="Sent", request_id="req123"
        ))

        # 1. First critical spike -> Dispatches SMS
        dispatch1 = manager.evaluate_and_dispatch_alert(
            device_id="ESP32-01",
            overall_status="CRITICAL",
            tds=2250,
            ph=7.2,
            turbidity=1.0,
            temp=24.0,
        )
        assert dispatch1 is not None
        assert dispatch1["dispatched"] is True

        # 2. Subsequent polling tick 2 seconds later with same critical state -> Cooldown suppresses duplicate SMS!
        dispatch2 = manager.evaluate_and_dispatch_alert(
            device_id="ESP32-01",
            overall_status="CRITICAL",
            tds=2280,
            ph=7.2,
            turbidity=1.0,
            temp=24.0,
        )
        assert dispatch2 is None, "Expected duplicate alert to be suppressed by cooldown!"

    def test_disabled_notifications_blocks_alert(self):
        manager = SMSNotificationManager(provider=Fast2SMSProvider(api_key="test_key"))
        manager.preferences["is_enabled"] = False  # Disabled by user

        dispatch = manager.evaluate_and_dispatch_alert(
            device_id="ESP32-01",
            overall_status="CRITICAL",
            tds=2300,
            ph=7.2,
            turbidity=1.0,
            temp=24.0,
        )
        assert dispatch is None

    def test_min_severity_filter(self):
        manager = SMSNotificationManager(provider=Fast2SMSProvider(api_key="test_key"))
        manager.preferences["min_severity"] = "CRITICAL"  # Only CRITICAL

        # WARNING alert should be ignored
        dispatch = manager.evaluate_and_dispatch_alert(
            device_id="ESP32-01",
            overall_status="WARNING",
            tds=600,
            ph=7.2,
            turbidity=1.0,
            temp=24.0,
        )
        assert dispatch is None
