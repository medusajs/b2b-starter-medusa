"""Integration service for INMETRO validation in HaaS Platform."""

import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

from app.models.distributors import ConnectionRequest
from validators.inmetro.models import (
    EquipmentRecord,
    CertificationInfo
)
from validators.inmetro.validator import (
    RecordValidator,
    DatasheetValidationError
)
from validators.inmetro.schema_loader import load_datasheet_schema

logger = logging.getLogger(__name__)


class INMETROValidationError(Exception):
    """Error raised when INMETRO validation fails."""

    def __init__(self, message: str, details: Optional[List[str]] = None):
        super().__init__(message)
        self.details = details or []


class INMETROValidationService:
    """Service for validating connection requests against
    INMETRO requirements."""

    def __init__(self):
        # Load the datasheet schema
        schema_path = (
            Path(__file__).resolve().parents[3] /
            "schemas" / "datasheets_certificados.schema.json"
        )
        self.schema = load_datasheet_schema(schema_path)
        self.validator = RecordValidator(self.schema)

    def validate_equipment_for_connection(
        self,
        equipment_data: Dict[str, Any],
        connection_request: ConnectionRequest
    ) -> Dict[str, Any]:
        """Validate equipment data against INMETRO requirements
        for a connection request.

        Args:
            equipment_data: Equipment information from distributor request
            connection_request: The connection request details

        Returns:
            Validation result with status and details
        """
        try:
            # Convert equipment data to EquipmentRecord
            equipment_record = self._create_equipment_record(equipment_data)

            # Validate against schema
            self.validator.validate_record(equipment_record)

            # Check certification validity
            if not equipment_record.is_valid():
                raise INMETROValidationError(
                    "Equipment certification has expired",
                    ["Certificate validity date has passed"]
                )

            # Validate equipment suitability for connection type
            suitability_errors = self._validate_equipment_suitability(
                equipment_record, connection_request
            )
            if suitability_errors:
                raise INMETROValidationError(
                    "Equipment not suitable for connection type",
                    suitability_errors
                )

            return {
                "valid": True,
                "equipment_record": equipment_record,
                "certification_status": "valid",
                "warnings": []
            }

        except DatasheetValidationError as e:
            logger.error(f"Schema validation failed: {e}")
            return {
                "valid": False,
                "errors": [f"Schema validation error: {e}"],
                "certification_status": "invalid"
            }

        except INMETROValidationError as e:
            logger.error(f"INMETRO validation failed: {e}")
            return {
                "valid": False,
                "errors": [str(e)] + e.details,
                "certification_status": "invalid"
            }

        except Exception as e:
            logger.error(f"Unexpected validation error: {e}")
            return {
                "valid": False,
                "errors": [f"Validation system error: {str(e)}"],
                "certification_status": "unknown"
            }

    def _create_equipment_record(
        self,
        equipment_data: Dict[str, Any]
    ) -> EquipmentRecord:
        """Create an EquipmentRecord from equipment data."""
        # Extract certification info
        certificacao_data = equipment_data.get("certificacao", {})

        certificacao = CertificationInfo(
            normas_ensaios=certificacao_data.get("normas_ensaios", []),
            ocp=certificacao_data.get("ocp"),
            certificado_numero=certificacao_data.get("certificado_numero"),
            registro_inmetro=certificacao_data.get("registro_inmetro"),
            laboratorio_ensaio=certificacao_data.get("laboratorio_ensaio"),
            data_emissao=certificacao_data.get("data_emissao"),
            data_validade=certificacao_data.get("data_validade")
        )

        # Create equipment record
        return EquipmentRecord(
            categoria=equipment_data.get("categoria", ""),
            fabricante=equipment_data.get("fabricante", ""),
            modelo=equipment_data.get("modelo", ""),
            familia=equipment_data.get("familia"),
            datasheet=equipment_data.get("datasheet", {}),
            certificacao=certificacao,
            raw_payload=equipment_data
        )

    def _validate_equipment_suitability(
        self,
        equipment: EquipmentRecord,
        connection_request: ConnectionRequest
    ) -> List[str]:
        """Validate if equipment is suitable for the connection type."""
        errors = []

        # Check power requirements
        if hasattr(equipment, 'datasheet') and equipment.datasheet.atributos:
            potencia_nominal = equipment.datasheet.atributos.get(
                "potencia_nominal_ac"
            )
            if potencia_nominal:
                # For residential connections, limit to 75kW per INMETRO rules
                if (connection_request.connection_type == "residential" and
                        potencia_nominal > 75):
                    errors.append(
                        f"Equipment power ({potencia_nominal}kW) exceeds "
                        "75kW limit for residential connections per "
                        "Portaria 140/2022"
                    )

        # Check required norms based on equipment category
        required_norms = self._get_required_norms(equipment.categoria)
        if required_norms:
            missing_norms = (
                set(required_norms) -
                set(equipment.certificacao.normas_ensaios)
            )
            if missing_norms:
                errors.append(
                    f"Missing required certification norms for "
                    f"{equipment.categoria}: {', '.join(missing_norms)}"
                )

        return errors

    def _get_required_norms(self, categoria: str) -> List[str]:
        """Get required certification norms for equipment category."""
        norms_map = {
            "modulo_fotovoltaico": ["IEC 61215", "IEC 61730"],
            "inversor_on_grid": [
                "ABNT NBR 16149", "ABNT NBR 16150",
                "IEC 62116", "IEC 62109-2"
            ],
            "inversor_hibrido": [
                "ABNT NBR 16149", "ABNT NBR 16150",
                "IEC 62116", "IEC 62109-2"
            ],
            "microinversor": ["ABNT NBR 16149", "IEC 62109-2"],
            "bateria_bess": ["IEC 62619", "IEC 62133"],
            "controlador_carga_mppt": ["IEC 62109-1"]
        }
        return norms_map.get(categoria, [])

    def validate_equipment_batch(
        self,
        equipment_list: List[Dict[str, Any]],
        connection_request: ConnectionRequest
    ) -> Dict[str, Any]:
        """Validate a batch of equipment for a connection request.

        Args:
            equipment_list: List of equipment data
            connection_request: The connection request details

        Returns:
            Batch validation result
        """
        results = []
        all_valid = True

        for i, equipment_data in enumerate(equipment_list):
            result = self.validate_equipment_for_connection(
                equipment_data, connection_request
            )
            result["equipment_index"] = i
            results.append(result)

            if not result["valid"]:
                all_valid = False

        return {
            "valid": all_valid,
            "equipment_count": len(equipment_list),
            "results": results,
            "summary": {
                "valid_equipment": sum(1 for r in results if r["valid"]),
                "invalid_equipment": sum(1 for r in results if not r["valid"])
            }
        }


# Global instance for easy access
inmetro_validator = INMETROValidationService()
