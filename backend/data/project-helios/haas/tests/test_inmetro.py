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
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.validate_certificate.return_value = {
                "valid": True,
                "details": valid_inmetro_certificate
            }
            mock_pipeline.return_value = mock_instance

            response = client.post(
                "/api/inmetro/validate",
                json={
                    "certificate_number": "BR-001-2024",
                    "product_type": "inverter"
                },
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["valid"] is True
            assert "validation_id" in data

    def test_validate_invalid_certificate(
        self,
        client,
        auth_headers,
        invalid_inmetro_certificate
    ):
        """Test validation of invalid certificate."""
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.validate_certificate.return_value = {
                "valid": False,
                "details": invalid_inmetro_certificate,
                "errors": ["Certificate not found in INMETRO database"]
            }
            mock_pipeline.return_value = mock_instance

            response = client.post(
                "/api/inmetro/validate",
                json={
                    "certificate_number": "INVALID-000-0000",
                    "product_type": "inverter"
                },
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["valid"] is False
            assert "errors" in data

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
        validation_id = "VAL-001"

        response = client.get(
            f"/api/inmetro/status/{validation_id}",
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "validation_id" in data
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
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.get_certificate.return_value = (
                valid_inmetro_certificate
            )
            mock_pipeline.return_value = mock_instance

            response = client.get(
                "/api/inmetro/certificate/BR-001-2024",
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["certificate_number"] == "BR-001-2024"
            assert data["manufacturer"] == "Fronius"

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
        response = client.get(
            "/api/inmetro/search",
            params={"manufacturer": "Fronius"},
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_search_by_product_type(self, client, auth_headers):
        """Test searching by product type."""
        response = client.get(
            "/api/inmetro/search",
            params={"product_type": "inverter"},
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data

    def test_search_with_multiple_filters(self, client, auth_headers):
        """Test search with multiple query parameters."""
        response = client.get(
            "/api/inmetro/search",
            params={
                "manufacturer": "Fronius",
                "product_type": "inverter",
                "min_power": 3000
            },
            headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK

    def test_search_no_results(self, client, auth_headers):
        """Test search with no matching results."""
        response = client.get(
            "/api/inmetro/search",
            params={"manufacturer": "NonExistentBrand"},
            headers=auth_headers
        )

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
        certificates = [
            {
                "certificate_number": "BR-001-2024",
                "product_type": "inverter"
            },
            {
                "certificate_number": "BR-002-2024",
                "product_type": "module"
            },
            {
                "certificate_number": "BR-003-2024",
                "product_type": "inverter"
            }
        ]

        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.validate_certificate.return_value = {
                "valid": True
            }
            mock_pipeline.return_value = mock_instance

            response = client.post(
                "/api/inmetro/batch",
                json={"certificates": certificates},
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "batch_id" in data
            assert "total" in data
            assert data["total"] == 3

    def test_batch_validation_mixed_results(self, client, auth_headers):
        """Test batch with mix of valid and invalid certificates."""
        certificates = [
            {
                "certificate_number": "BR-001-2024",
                "product_type": "inverter"
            },
            {
                "certificate_number": "INVALID-000",
                "product_type": "inverter"
            }
        ]

        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()

            def validate_side_effect(cert_num, prod_type):
                if "INVALID" in cert_num:
                    return {"valid": False}
                return {"valid": True}

            mock_instance.validate_certificate.side_effect = (
                validate_side_effect
            )
            mock_pipeline.return_value = mock_instance

            response = client.post(
                "/api/inmetro/batch",
                json={"certificates": certificates},
                headers=auth_headers
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            # Should process all regardless of individual validity
            assert data["total"] == 2

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
        # Assuming max limit is 100
        certificates = [
            {
                "certificate_number": f"BR-{i:03d}-2024",
                "product_type": "inverter"
            }
            for i in range(150)
        ]

        response = client.post(
            "/api/inmetro/batch",
            json={"certificates": certificates},
            headers=auth_headers
        )

        # Should either reject or process only first N
        assert response.status_code in [
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST
        ]


# ==================== Integration Tests ====================

@pytest.mark.inmetro
@pytest.mark.integration
class TestINMETROFlowIntegration:
    """Test complete INMETRO validation flows."""

    def test_validate_then_check_status(self, client, auth_headers):
        """Test validate → check status flow."""
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.validate_certificate.return_value = {
                "valid": True,
                "validation_id": "VAL-001"
            }
            mock_pipeline.return_value = mock_instance

            # Step 1: Validate certificate
            validate_response = client.post(
                "/api/inmetro/validate",
                json={
                    "certificate_number": "BR-001-2024",
                    "product_type": "inverter"
                },
                headers=auth_headers
            )
            assert validate_response.status_code == status.HTTP_200_OK
            validation_id = validate_response.json()["validation_id"]

            # Step 2: Check status
            status_response = client.get(
                f"/api/inmetro/status/{validation_id}",
                headers=auth_headers
            )
            assert status_response.status_code == status.HTTP_200_OK

    def test_search_then_validate_certificate(self, client, auth_headers):
        """Test search → validate specific certificate flow."""
        with patch('app.routers.inmetro.InmetroPipeline') as mock_pipeline:
            mock_instance = Mock()
            mock_instance.search_certificates.return_value = {
                "results": [{"certificate_number": "BR-001-2024"}]
            }
            mock_instance.validate_certificate.return_value = {
                "valid": True
            }
            mock_pipeline.return_value = mock_instance

            # Step 1: Search for certificates
            search_response = client.get(
                "/api/inmetro/search",
                params={"manufacturer": "Fronius"},
                headers=auth_headers
            )
            assert search_response.status_code == status.HTTP_200_OK

            # Step 2: Validate found certificate
            cert_number = "BR-001-2024"
            validate_response = client.post(
                "/api/inmetro/validate",
                json={
                    "certificate_number": cert_number,
                    "product_type": "inverter"
                },
                headers=auth_headers
            )
            assert validate_response.status_code == status.HTTP_200_OK
