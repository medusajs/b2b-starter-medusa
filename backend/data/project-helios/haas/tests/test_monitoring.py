"""
HaaS Platform - Monitoring API Tests
Covers dashboard, metrics, alerts list and acknowledge endpoints.
"""
import pytest
from fastapi import status


@pytest.mark.monitoring
@pytest.mark.unit
class TestMonitoringDashboard:
    """Tests for GET /api/monitoring/dashboard."""

    def test_dashboard_ok(self, client, auth_headers):
        resp = client.get("/api/monitoring/dashboard", headers=auth_headers)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        # Basic shape
        for key in [
            "uptime_seconds",
            "total_requests",
            "requests_per_minute",
            "avg_latency_ms",
            "error_rate_pct",
            "active_users",
            "services",
            "active_alerts",
            "timestamp",
        ]:
            assert key in data
        assert isinstance(data["services"], list)


@pytest.mark.monitoring
@pytest.mark.unit
class TestMonitoringMetrics:
    """Tests for GET /api/monitoring/metrics with different periods."""

    @pytest.mark.parametrize("period", ["1h", "24h", "7d", "30d"]) 
    def test_metrics_periods(self, client, auth_headers, period):
        resp = client.get(
            "/api/monitoring/metrics", params={"period": period}, headers=auth_headers
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        # Basic fields
        for key in [
            "period",
            "start_time",
            "end_time",
            "total_requests",
            "total_errors",
            "error_rate_pct",
            "latency_p50_ms",
            "latency_p95_ms",
            "latency_p99_ms",
            "requests_by_endpoint",
            "latency_over_time",
            "requests_over_time",
        ]:
            assert key in data


@pytest.mark.monitoring
@pytest.mark.unit
class TestMonitoringAlerts:
    """Tests for alerts listing and acknowledgement."""

    def test_alerts_list_all(self, client, auth_headers):
        resp = client.get("/api/monitoring/alerts", headers=auth_headers)
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert "alerts" in data
        assert isinstance(data["alerts"], list)

    @pytest.mark.parametrize("severity", ["critical", "warning", "info"]) 
    def test_alerts_filtered(self, client, auth_headers, severity):
        resp = client.get(
            "/api/monitoring/alerts", params={"severity": severity}, headers=auth_headers
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        for alert in data.get("alerts", []):
            assert alert["severity"] == severity

    def test_acknowledge_alert(self, client, auth_headers):
        resp = client.post(
            "/api/monitoring/alerts/ALERT-123/acknowledge", headers=auth_headers
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["message"].startswith("Alert ")
        assert data["acknowledged_by"]
        assert data["acknowledged_at"]

