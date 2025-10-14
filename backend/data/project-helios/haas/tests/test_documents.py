"""
HaaS Platform - Documents API Tests
Tests for memorial generation, diagram generation, retrieval, and listing.
"""
import pytest
from fastapi import status


def sample_project_payload():
    return {
        "project_name": "Sistema Solar 10kWp",
        "client_name": "Joao Teste",
        "client_cpf_cnpj": "123.456.789-00",
        "location": {
            "address": "Rua A, 123",
            "city": "Belo Horizonte",
            "state": "MG",
            "zip_code": "30000-000",
            "distributor": "CEMIG",
        },
        "equipments": [
            {
                "type": "panel",
                "manufacturer": "Canadian Solar",
                "model": "CS3W-450MS",
                "quantity": 22,
                "power_w": 450,
                "inmetro_certified": True,
            }
        ],
        "total_power_kwp": 9.9,
        "estimated_generation_kwh_month": 1250,
        "installation_type": "residencial",
        "connection_type": "monofasico",
    }


def sample_diagram_payload():
    return {
        "project_data": sample_project_payload(),
        "system_design": {
            "project_id": "proj_123",
            "modules_layout": {"arrays": 2, "orientation": "N"},
            "inverters": [
                {
                    "type": "inverter",
                    "manufacturer": "Fronius",
                    "model": "Primo 8.2-1",
                    "quantity": 1,
                    "power_w": 8200,
                    "inmetro_certified": True,
                }
            ],
            "string_configuration": {"strings": 2, "modules_per_string": 11},
            "cable_sizing": {"dc": "6mm2"},
            "protection_devices": {"dps": True},
        },
        "diagram_types": ["unifilar"],
        "include_technical_specs": True,
        "validate_nbr5410": True,
    }


@pytest.mark.documents
@pytest.mark.unit
class TestMemorial:
    def test_generate_memorial_and_get(self, client, auth_headers, monkeypatch):
        # Make background generator complete immediately
        import app.routers.documents as docs

        def immediate_generate(document_id: str, project_data, user_email: str):
            if document_id in docs._documents_storage:
                d = docs._documents_storage[document_id]
                d.status = docs.DocumentStatus.COMPLETED
                d.file_url = f"https://s3.amazonaws.com/haas-docs/{document_id}.pdf"
                d.file_size_bytes = 123456
                d.completed_at = __import__("datetime").datetime.utcnow()

        monkeypatch.setattr(docs, "_generate_memorial_pdf", immediate_generate)

        payload = sample_project_payload()
        resp = client.post(
            "/api/documents/memorial", json=payload, headers=auth_headers
        )
        assert resp.status_code == status.HTTP_202_ACCEPTED
        data = resp.json()
        assert data["status"] == "processing"
        doc_id = data["document_id"]

        # Retrieve document - should be completed by our patched background
        get_resp = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
        assert get_resp.status_code == status.HTTP_200_OK
        doc = get_resp.json()
        assert doc["document_id"] == doc_id
        assert doc["status"] in ["completed", "processing", "pending"]
        # If completed, URL must be present
        if doc["status"] == "completed":
            assert doc["file_url"]


@pytest.mark.documents
@pytest.mark.unit
class TestDiagrams:
    def test_generate_diagrams_and_list(self, client, auth_headers, monkeypatch):
        import app.routers.documents as docs

        def immediate_generate(document_id: str, diagram_request, user_email: str):
            if document_id in docs._documents_storage:
                d = docs._documents_storage[document_id]
                d.status = docs.DocumentStatus.COMPLETED
                d.file_url = f"https://s3.amazonaws.com/haas-docs/{document_id}.pdf"
                d.file_size_bytes = 222222
                d.completed_at = __import__("datetime").datetime.utcnow()

        monkeypatch.setattr(docs, "_generate_diagrams_pdf", immediate_generate)

        payload = sample_diagram_payload()
        resp = client.post(
            "/api/documents/diagrams", json=payload, headers=auth_headers
        )
        assert resp.status_code == status.HTTP_202_ACCEPTED
        doc_id = resp.json()["document_id"]

        # List documents for user
        list_resp = client.get("/api/documents/", headers=auth_headers)
        assert list_resp.status_code == status.HTTP_200_OK
        items = list_resp.json()
        assert isinstance(items, list)
        assert any(item["document_id"] == doc_id for item in items)

