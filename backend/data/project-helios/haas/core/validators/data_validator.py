"""
Módulo de validação de dados usando JSON Schema
Valida dados de contato e endereço contra schemas definidos
"""

import json
import jsonschema
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Resultado da validação"""

    is_valid: bool
    errors: List[str]
    warnings: List[str]
    schema_version: str


class DataValidator:
    """Validador de dados usando JSON Schema"""

    def __init__(self, schemas_dir: Optional[Path] = None):
        if schemas_dir is None:
            # Usar diretório padrão baseado na configuração do HaaS Platform
            base_dir = Path(__file__).parent.parent.parent
            self.schemas_dir = base_dir / "schemas"
        else:
            self.schemas_dir = schemas_dir
        self.schemas = {}
        self._load_schemas()

    def _load_schemas(self) -> None:
        """Carrega todos os schemas disponíveis"""
        schema_files = {
            "contatos": "contatos_normalizados.schema.json",
            "enderecos": "enderecos_normalizados.schema.json",
        }

        for schema_name, filename in schema_files.items():
            schema_path = self.schemas_dir / filename
            if schema_path.exists():
                with open(schema_path, "r", encoding="utf-8") as f:
                    self.schemas[schema_name] = json.load(f)
                print(f"Schema '{schema_name}' carregado: {filename}")
            else:
                print(f"Aviso: Schema '{schema_name}' não encontrado: {filename}")

    def validate_data(self, data: Dict[str, Any], schema_name: str) -> ValidationResult:
        """
        Valida dados contra um schema específico
        """
        if schema_name not in self.schemas:
            return ValidationResult(
                is_valid=False,
                errors=[f"Schema '{schema_name}' não encontrado"],
                warnings=[],
                schema_version="unknown",
            )

        schema = self.schemas[schema_name]
        schema_version = schema.get("version", "1.0")

        errors = []
        warnings = []

        try:
            # Validação principal
            jsonschema.validate(data, schema)
            is_valid = True
        except jsonschema.ValidationError as e:
            is_valid = False
            errors.append(f"Erro de validação: {e.message}")
            errors.append(f"Caminho: {' -> '.join(str(p) for p in e.absolute_path)}")
        except jsonschema.SchemaError as e:
            is_valid = False
            errors.append(f"Erro no schema: {e.message}")
        except Exception as e:
            is_valid = False
            errors.append(f"Erro inesperado: {str(e)}")

        # Validações adicionais específicas
        if is_valid:
            warnings.extend(self._additional_validations(data, schema_name))

        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            schema_version=schema_version,
        )

    def _additional_validations(
        self, data: Dict[str, Any], schema_name: str
    ) -> List[str]:
        """
        Validações adicionais específicas do domínio
        """
        warnings = []

        if schema_name == "contatos":
            warnings.extend(self._validate_contacts_data(data))
        elif schema_name == "enderecos":
            warnings.extend(self._validate_addresses_data(data))

        return warnings

    def _validate_contacts_data(self, data: Dict[str, Any]) -> List[str]:
        """Validações específicas para dados de contato"""
        warnings = []

        contatos = data.get("contatos", {})
        total_cpfs = data.get("total_cpfs", 0)

        # Verifica se total_cpfs corresponde ao número real de contatos
        actual_count = len(contatos)
        if actual_count != total_cpfs:
            warnings.append(
                f"Total de CPFs declarado ({total_cpfs}) difere do real ({actual_count})"
            )

        # Validações por CPF
        for cpf, contact_data in contatos.items():
            # Verifica formato do CPF
            if not self._is_valid_cpf_format(cpf):
                warnings.append(f"CPF com formato inválido: {cpf}")

            # Verifica telefones
            phones = contact_data.get("telefones", [])
            preferencial_count = sum(1 for p in phones if p.get("preferencial", False))
            if preferencial_count != 1 and phones:
                warnings.append(
                    f"CPF {cpf}: deve ter exatamente 1 telefone preferencial, encontrado {preferencial_count}"
                )

            # Verifica scores de prioridade
            for phone in phones:
                score = phone.get("score_prioridade", 0)
                if score < 0:
                    warnings.append(f"CPF {cpf}: telefone com score negativo: {score}")

        return warnings

    def _validate_addresses_data(self, data: Dict[str, Any]) -> List[str]:
        """Validações específicas para dados de endereço"""
        warnings = []

        enderecos = data.get("enderecos", {})
        total_cpfs = data.get("total_cpfs", 0)

        # Verifica se total_cpfs corresponde
        actual_count = len(enderecos)
        if actual_count != total_cpfs:
            warnings.append(
                f"Total de CPFs declarado ({total_cpfs}) difere do real ({actual_count})"
            )

        # Validações por CPF
        for cpf, address_data in enderecos.items():
            # Verifica formato do CPF
            if not self._is_valid_cpf_format(cpf):
                warnings.append(f"CPF com formato inválido: {cpf}")

            # Verifica endereços
            addresses = address_data.get("enderecos", [])
            for addr in addresses:
                # Verifica CEP
                cep = addr.get("cep")
                if cep and not self._is_valid_cep_format(str(cep)):
                    warnings.append(f"CPF {cpf}: CEP com formato inválido: {cep}")

                # Verifica UF
                uf = addr.get("uf")
                if uf and not self._is_valid_uf(str(uf)):
                    warnings.append(f"CPF {cpf}: UF inválida: {uf}")

                # Verifica coordenadas
                coords = addr.get("coordenadas")
                if coords:
                    lat = coords.get("latitude")
                    lon = coords.get("longitude")
                    if lat is not None and (lat < -90 or lat > 90):
                        warnings.append(f"CPF {cpf}: latitude fora do range: {lat}")
                    if lon is not None and (lon < -180 or lon > 180):
                        warnings.append(f"CPF {cpf}: longitude fora do range: {lon}")

        return warnings

    def _is_valid_cpf_format(self, cpf: str) -> bool:
        """Verifica se CPF tem formato válido (11 dígitos)"""
        return bool(cpf and cpf.isdigit() and len(cpf) == 11)

    def _is_valid_cep_format(self, cep: str) -> bool:
        """Verifica se CEP tem formato válido (8 dígitos)"""
        return bool(cep and cep.isdigit() and len(cep) == 8)

    def _is_valid_uf(self, uf: str) -> bool:
        """Verifica se UF é válida"""
        ufs_validas = {
            "AC",
            "AL",
            "AP",
            "AM",
            "BA",
            "CE",
            "DF",
            "ES",
            "GO",
            "MA",
            "MT",
            "MS",
            "MG",
            "PA",
            "PB",
            "PR",
            "PE",
            "PI",
            "RJ",
            "RN",
            "RS",
            "RO",
            "RR",
            "SC",
            "SP",
            "SE",
            "TO",
        }
        return uf.upper() in ufs_validas

    def validate_file(self, file_path: Path, schema_name: str) -> ValidationResult:
        """
        Valida um arquivo JSON contra um schema
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                errors=[f"Erro ao carregar arquivo: {str(e)}"],
                warnings=[],
                schema_version="unknown",
            )

        return self.validate_data(data, schema_name)


def validate_contacts_file(
    file_path: Path = Path("derived_data/contatos_normalizados_v1.json"),
) -> ValidationResult:
    """
    Função de conveniência para validar arquivo de contatos
    """
    validator = DataValidator()
    return validator.validate_file(file_path, "contatos")


def validate_addresses_file(
    file_path: Path = Path("derived_data/enderecos_normalizados_v1.json"),
) -> ValidationResult:
    """
    Função de conveniência para validar arquivo de endereços
    """
    validator = DataValidator()
    return validator.validate_file(file_path, "enderecos")


if __name__ == "__main__":
    print("=== Validador de Dados ===")

    # Testa validação de contatos
    contacts_file = Path("derived_data/contatos_normalizados_v1.json")
    if contacts_file.exists():
        print(f"Validando arquivo de contatos: {contacts_file}")
        result = validate_contacts_file(contacts_file)

        print(f"Válido: {result.is_valid}")
        print(f"Versão do schema: {result.schema_version}")

        if result.errors:
            print("Erros encontrados:")
            for error in result.errors:
                print(f"  - {error}")

        if result.warnings:
            print(" Avisos:")
            for warning in result.warnings:
                print(f"  - {warning}")

        if result.is_valid and not result.errors and not result.warnings:
            print("✅ Arquivo validado com sucesso!")

    else:
        print("Arquivo de contatos não encontrado para validação")
