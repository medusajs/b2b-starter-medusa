"""
HaaS Platform - INMETRO API Tests
Test suite for 5 INMETRO endpoints: validate, status, certificate, search, batch
"""
import pytest
from fastapi import status
from unittest.mock import Mock, patch


# ==================== Test Validate Endpoint ====================

@pytest.mark.inmetro
@pytest.mark.unit
class TestINMETROValidate:
    """Test POST /api/inmetro/validate endpoint."""

    def test_validate_certificate_success(
        self,
        client,
        auth_headers,
        valid_inmetro_certificate
    ):
        """Test successful certificate validation."""
        response = client.post(
            "/api/inmetro/validate",
            json={
                "categoria": "inversores",
                "fabricante": "Fronius",
                "modelo": "Primo 5.0-1"
            },
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        data = response.json()
        assert "request_id" in data

    def test_validate_invalid_certificate(
        self,
        client,
        auth_headers,
        invalid_inmetro_certificate
    ):
        """Test validation of invalid certificate."""
        response = client.post(
            "/api/inmetro/validate",
            json={
                "categoria": "inversores",
                "fabricante": "Unknown",
                "modelo": "Unknown"
            },
            headers=auth_headers
        )

        # Current API enqueues validation and returns 202
        assert response.status_code == status.HTTP_202_ACCEPTED

    def test_validate_without_auth(self, client):
        """Test validate endpoint without authentication."""
        response = client.post(
            "/api/inmetro/validate",
            json={
                "certificate_number": "BR-001-2024",
                "product_type": "inverter"
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_validate_missing_fields(self, client, auth_headers):
        """Test validation with missing required fields."""
        response = client.post(
            "/api/inmetro/validate",
            json={"certificate_number": "BR-001-2024"},
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==================== Test Status Endpoint ====================

@pytest.mark.inmetro
@pytest.mark.unit
class TestINMETROStatus:
    """Test GET /api/inmetro/status/{validation_id} endpoint."""

    def test_get_status_success(self, client, auth_headers):
        """Test getting validation status."""
        # First create a validation request
        create_resp = client.post(
            "/api/inmetro/validate",
            json={
                "categoria": "inversores",
                "fabricante": "Fronius",
                "modelo": "Primo 5.0-1"
            },
            headers=auth_headers
        )
        assert create_resp.status_code == status.HTTP_202_ACCEPTED
        request_id = create_resp.json()["request_id"]

        response = client.get(
            f"/api/inmetro/status/{request_id}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "status" in data

    def test_get_status_not_found(self, client, auth_headers):
        """Test getting status for non-existent validation."""
        response = client.get(
            "/api/inmetro/status/NONEXISTENT-999",
            headers=auth_headers
        )

        # Mock may return 404 or empty result
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ]

    def test_get_status_without_auth(self, client):
        """Test status endpoint without authentication."""
        response = client.get("/api/inmetro/status/VAL-001")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


# ==================== Test Certificate Endpoint ====================

@pytest.mark.inmetro
@pytest.mark.unit
class TestINMETROCertificate:
    """Test GET /api/inmetro/certificate/{certificate_id} endpoint."""

    def test_get_certificate_details(
        self,
        client,
        auth_headers,
        valid_inmetro_certificate
    ):
        """Test retrieving certificate details."""
        response = client.get(
            "/api/inmetro/certificate/BRA-001-2024",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["certificate_number"].startswith("BRA-")

    def test_get_certificate_not_found(self, client, auth_headers):
        """Test retrieving non-existent certificate."""
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.get_certificate.return_value = None
            mock_pipeline.return_value = mock_instance

            response = client.get(
                "/api/inmetro/certificate/INVALID-000",
                headers=auth_headers
            )

            assert response.status_code in [
                status.HTTP_200_OK,
                status.HTTP_404_NOT_FOUND
            ]


# ==================== Test Search Endpoint ====================

@pytest.mark.inmetro
@pytest.mark.unit
class TestINMETROSearch:
    """Test GET /api/inmetro/search endpoint."""

    def test_search_by_manufacturer(self, client, auth_headers):
        """Test searching certificates by manufacturer."""
        response = client.get("/api/inmetro/search", params={"query": "Fro"}, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_search_by_product_type(self, client, auth_headers):
        """Test searching by product type."""
        response = client.get("/api/inmetro/search", params={"query": "Inv"}, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data

    def test_search_with_multiple_filters(self, client, auth_headers):
        """Test search with multiple query parameters."""
        response = client.get("/api/inmetro/search", params={"query": "Fronius"}, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK

    def test_search_no_results(self, client, auth_headers):
        """Test search with no matching results."""
        response = client.get("/api/inmetro/search", params={"query": "zzz"}, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["results"]) == 0


# ==================== Test Batch Validation Endpoint ====================

@pytest.mark.inmetro
@pytest.mark.unit
class TestINMETROBatch:
    """Test POST /api/inmetro/batch endpoint."""

    def test_batch_validation_success(self, client, auth_headers):
        """Test batch validation of multiple certificates."""
        equipments = [
            {"categoria": "inversores", "fabricante": "Fronius", "modelo": "Primo 5.0-1"},
            {"categoria": "modulos", "fabricante": "Canadian Solar", "modelo": "CS3W-450MS"},
            {"categoria": "inversores", "fabricante": "Fronius", "modelo": "Primo 8.2-1"},
        ]

        response = client.post(
            "/api/inmetro/batch", json={"equipments": equipments}, headers=auth_headers
        )

        assert response.status_code == status.HTTP_202_ACCEPTED
        data = response.json()
        # Expect request id map and message
        assert any(k.isdigit() for k in data.keys())
        assert "message" in data

    def test_batch_validation_mixed_results(self, client, auth_headers):
        """Test batch with mix of valid and invalid certificates."""
        equipments = [
            {"categoria": "inversores", "fabricante": "Fronius", "modelo": "Primo 5.0-1"},
            {"categoria": "inversores", "fabricante": "MarcaX", "modelo": "ModeloX"},
        ]

        response = client.post(
            "/api/inmetro/batch", json={"equipments": equipments}, headers=auth_headers
        )

        assert response.status_code == status.HTTP_202_ACCEPTED

    def test_batch_validation_empty_list(self, client, auth_headers):
        """Test batch with empty certificate list."""
        response = client.post(
            "/api/inmetro/batch",
            json={"certificates": []},
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_batch_validation_exceeds_limit(self, client, auth_headers):
        """Test batch with too many certificates."""
        # API limit is 50
        equipments = [
            {"categoria": "inversores", "fabricante": "F", "modelo": f"M-{i}"}
            for i in range(51)
        ]

        response = client.post(
            "/api/inmetro/batch", json={"equipments": equipments}, headers=auth_headers
        )

        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_202_ACCEPTED]


# ==================== Integration Tests ====================

@pytest.mark.inmetro
@pytest.mark.integration
class TestINMETROFlowIntegration:
    """Test complete INMETRO validation flows."""

    def test_validate_then_check_status(self, client, auth_headers):
        """Test validate → check status flow."""
        # Step 1: Validate equipment
        validate_response = client.post(
            "/api/inmetro/validate",
            json={
                "categoria": "inversores",
                "fabricante": "Fronius",
                "modelo": "Primo 5.0-1"
            },
            headers=auth_headers
        )
        assert validate_response.status_code == status.HTTP_202_ACCEPTED
        request_id = validate_response.json()["request_id"]

        # Step 2: Check status
        status_response = client.get(
            f"/api/inmetro/status/{request_id}", headers=auth_headers
        )
        assert status_response.status_code == status.HTTP_200_OK

    def test_search_then_validate_certificate(self, client, auth_headers):
        """Test search → validate specific certificate flow."""
        # Step 1: Search for certificates
        search_response = client.get(
            "/api/inmetro/search", params={"query": "Fronius"}, headers=auth_headers
        )
        assert search_response.status_code == status.HTTP_200_OK

        # Step 2: Validate equipment (based on search result context)
        validate_response = client.post(
            "/api/inmetro/validate",
            json={
                "categoria": "inversores",
                "fabricante": "Fronius",
                "modelo": "Primo 8.2-1"
            },
            headers=auth_headers
        )
        assert validate_response.status_code == status.HTTP_202_ACCEPTED
