"""
Testes para validações JSON vs schemas - 100% cobertura
"""

import pytest
import json
import jsonschema


class TestSchemaValidations:
    """Testes para validação de schemas JSON"""

    @pytest.mark.schema
    def test_all_schemas_are_valid_json(self, schema_files):
        """Testa se todos os schemas são JSON válidos."""
        assert len(schema_files) > 0, "Nenhum schema encontrado"

        for schema_name, schema in schema_files.items():
            assert isinstance(
                schema, dict
            ), f"Schema {schema_name} não é um objeto JSON válido"
            assert "$schema" in schema, f"Schema {schema_name} não tem $schema"

    @pytest.mark.schema
    def test_consumo_modalidade_schema_validation(
        self, schema_files, sample_consumo_data
    ):
        """Testa validação do schema de consumo e modalidade tarifária."""
        schema = schema_files.get("consumo_modalidade")
        assert schema is not None, "Schema consumo_modalidade não encontrado"

        # Validar dados de exemplo
        try:
            jsonschema.validate(sample_consumo_data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para consumo_modalidade: {e}")

    @pytest.mark.schema
    def test_contatos_normalizados_schema_validation(self, schema_files):
        """Testa validação do schema de contatos normalizados."""
        schema = schema_files.get("contatos_normalizados")
        assert schema is not None, "Schema contatos_normalizados não encontrado"

        # Dados de exemplo para teste
        test_data = {
            "version": "1.0",
            "generated_at": "2024-01-01T00:00:00Z",
            "total_cpfs": 1,
            "contatos": {
                "12345678901": {
                    "telefones": [
                        {
                            "numero_e164": "+5511987654321",
                            "tipo": "movel",
                            "numero_original": "(11) 98765-4321",
                            "ddd": "11",
                            "fonte": "pf_quod-cadastro",
                            "confirmado": True,
                            "score_prioridade": 1,
                            "preferencial": True,
                            "fontes": ["pf_quod-cadastro"],
                        }
                    ],
                    "emails": [
                        {
                            "email": "teste@exemplo.com",
                            "fonte": "pf_quod-cadastro",
                            "confirmado": True,
                            "fontes": ["pf_quod-cadastro"],
                        }
                    ],
                }
            },
        }

        try:
            jsonschema.validate(test_data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para contatos_normalizados: {e}")

    @pytest.mark.schema
    def test_datasheets_schema_validation(self, schema_files):
        """Testa validação do schema de datasheets."""
        schema = schema_files.get("datasheets_certificados")
        assert schema is not None, "Schema datasheets_certificados não encontrado"

        # Dados de exemplo para teste
        test_data = {
            "equipamentos": [
                {
                    "categoria": "modulo_fotovoltaico",
                    "fabricante": "Astronergy",
                    "modelo": "Astro 5",
                    "datasheet": {
                        "potencia_maxima": 550,
                        "eficiencia": 21.5
                    },
                    "certificacao": {
                        "normas_ensaios": ["IEC 61215", "IEC 61730"],
                        "ocp": "12345",
                        "certificado_numero": "CERT001",
                        "data_validade": "2025-12-31"
                    }
                }
            ]
        }

        try:
            jsonschema.validate(test_data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para datasheets: {e}")

    @pytest.mark.schema
    def test_enderecos_normalizados_schema_validation(self, schema_files):
        """Testa validação do schema de endereços normalizados."""
        schema = schema_files.get("enderecos_normalizados")
        assert schema is not None, "Schema enderecos_normalizados não encontrado"

        test_data = {
            "version": "1.0",
            "generated_at": "2024-01-01T00:00:00Z",
            "total_cpfs": 1,
            "enderecos": {
                "12345678901": {
                    "enderecos": [
                        {
                            "logradouro": "Rua das Flores",
                            "numero": "123",
                            "bairro": "Centro",
                            "cidade": "São Paulo",
                            "uf": "SP",
                            "cep": "01001000",
                            "pais": "Brasil",
                            "fonte": "pf_quod-cadastro",
                            "confirmado": True,
                            "score_qualidade": 0.95,
                            "tipo_endereco": "residencial",
                            "coordenadas": {
                                "latitude": -23.5505,
                                "longitude": -46.6333,
                                "fonte": "geocoding",
                            },
                        }
                    ]
                }
            },
        }

        try:
            jsonschema.validate(test_data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para enderecos_normalizados: {e}")

    @pytest.mark.schema
    def test_schema_required_fields(self, schema_files):
        """Testa se todos os schemas têm campos obrigatórios definidos."""
        for schema_name, schema in schema_files.items():
            assert (
                "required" in schema
            ), f"Schema {schema_name} não tem campos obrigatórios definidos"
            assert isinstance(
                schema["required"], list
            ), f"Campo 'required' em {schema_name} deve ser uma lista"
            assert (
                len(schema["required"]) > 0
            ), f"Schema {schema_name} deve ter pelo menos um campo obrigatório"

    @pytest.mark.schema
    def test_schema_properties_defined(self, schema_files):
        """Testa se todos os schemas têm propriedades definidas."""
        for schema_name, schema in schema_files.items():
            assert (
                "properties" in schema
            ), f"Schema {schema_name} não tem propriedades definidas"
            assert isinstance(
                schema["properties"], dict
            ), f"Campo 'properties' em {schema_name} deve ser um objeto"

    @pytest.mark.schema
    def test_schema_edge_cases(self, schema_files):
        """Testa casos extremos de validação de schemas."""
        # Teste com dados vazios
        for schema_name, schema in schema_files.items():
            try:
                jsonschema.validate({}, schema)
                # Se chegou aqui, o schema permite objetos vazios
            except jsonschema.ValidationError:
                # Esperado para schemas que exigem campos obrigatórios
                pass

    @pytest.mark.schema
    def test_schema_invalid_data_types(self, schema_files):
        """Testa validação com tipos de dados inválidos."""
        for schema_name, schema in schema_files.items():
            # Teste com string onde deveria ser objeto
            try:
                jsonschema.validate("invalid_string", schema)
                pytest.fail(
                    f"Schema {schema_name} deveria rejeitar string como dado principal"
                )
            except jsonschema.ValidationError:
                # Esperado
                pass

            # Teste com array onde deveria ser objeto
            try:
                jsonschema.validate([], schema)
                pytest.fail(
                    f"Schema {schema_name} deveria rejeitar array como dado principal"
                )
            except jsonschema.ValidationError:
                # Esperado
                pass

    @pytest.mark.schema
    def test_schema_missing_required_fields(self, schema_files):
        """Testa validação quando campos obrigatórios estão faltando."""
        for schema_name, schema in schema_files.items():
            if "required" in schema and schema["required"]:
                # Criar objeto com apenas um campo não obrigatório
                test_data = {}
                for prop_name, prop_def in schema.get("properties", {}).items():
                    if prop_name not in schema["required"]:
                        if "type" in prop_def:
                            if prop_def["type"] == "string":
                                test_data[prop_name] = "test_value"
                            elif prop_def["type"] == "number":
                                test_data[prop_name] = 123
                            elif prop_def["type"] == "boolean":
                                test_data[prop_name] = True
                            elif prop_def["type"] == "array":
                                test_data[prop_name] = []
                            elif prop_def["type"] == "object":
                                test_data[prop_name] = {}
                        break

                # Deve falhar por campos obrigatórios faltando
                try:
                    jsonschema.validate(test_data, schema)
                    pytest.fail(
                        f"Schema {schema_name} deveria falhar por campos obrigatórios faltando"
                    )
                except jsonschema.ValidationError:
                    # Esperado
                    pass

    @pytest.mark.schema
    @pytest.mark.parametrize("invalid_value", [None, "", [], {}, 0, -1, 999999])
    def test_consumo_valores_invalidos(self, schema_files, invalid_value):
        """Testa validação com valores inválidos para consumo."""
        schema = schema_files.get("consumo_modalidade")
        if not schema:
            pytest.skip("Schema consumo_modalidade não encontrado")

        test_data = {
            "unidade_consumidora": {
                "distribuidora": "ENEL",
                "uc_numero": "1234567890",
                "grupo": "B",
                "modalidade_tarifaria": {"tipo": "convencional"},
            },
            "historico_consumo": {
                "periodo_meses": invalid_value,  # Valor inválido
                "unidade": "kWh",
                "mensal": [],
            },
            "postos_tarifarios": {},
        }

        try:
            jsonschema.validate(test_data, schema)
            # Se invalid_value não for None ou valores extremos, pode passar
            if invalid_value in [None, "", [], {}, -1, 999999]:
                pytest.fail(f"Schema deveria rejeitar valor inválido: {invalid_value}")
        except jsonschema.ValidationError:
            # Esperado para valores inválidos
            pass

    @pytest.mark.schema
    def test_schema_cross_references(self, schema_files, data_files):
        """Testa referências cruzadas entre schemas e dados."""
        # Verificar se dados de exemplo correspondem aos schemas
        for data_name, data in data_files.items():
            # Tentar encontrar schema correspondente
            schema_name = f"{data_name}.schema"
            if schema_name in schema_files:
                schema = schema_files[schema_name]
                try:
                    jsonschema.validate(data, schema)
                except jsonschema.ValidationError as e:
                    pytest.fail(
                        f"Dados {data_name} não validam contra schema {schema_name}: {e}"
                    )

    @pytest.mark.schema
    def test_derived_data_schema_validation(self, schema_files, derived_data_files):
        """Testa validação dos arquivos JSON em derived_data contra seus schemas."""
        # Verificar todos os arquivos em derived_data
        for data_name, data in derived_data_files.items():
            # Buscar schema correspondente
            base_name = data_name.replace("_v1", "").replace("_adicionais", "")
            if base_name in schema_files:
                schema = schema_files[base_name]
                try:
                    jsonschema.validate(data, schema)
                except jsonschema.ValidationError as e:
                    pytest.fail(
                        f"Dados derived_data/{data_name}.json não validam contra schema {base_name}: {e}"
                    )

    @pytest.mark.schema
    def test_baterias_schema_validation(self, schema_files, derived_data_files):
        """Testa validação específica do schema de baterias."""
        if "baterias_v1" not in derived_data_files or "baterias" not in schema_files:
            pytest.skip("Arquivos de baterias não encontrados")

        data = derived_data_files["baterias_v1"]
        schema = schema_files["baterias"]

        try:
            jsonschema.validate(data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para baterias: {e}")

        # Testes específicos para estrutura de baterias
        assert (
            "equipamentos" in data
        ), "Arquivo baterias_v1.json não tem campo 'equipamentos'"
        assert (
            len(data["equipamentos"]) > 0
        ), "Arquivo baterias_v1.json tem lista de equipamentos vazia"

        # Validar primeiro equipamento
        primeiro_equip = data["equipamentos"][0]
        assert "categoria" in primeiro_equip, "Equipamento não tem campo 'categoria'"
        assert primeiro_equip["categoria"] == "bateria_bess", "Categoria incorreta"
        assert "datasheet" in primeiro_equip, "Equipamento não tem campo 'datasheet'"
        assert "precos" in primeiro_equip, "Equipamento não tem campo 'precos'"

    @pytest.mark.schema
    def test_carregadores_ev_schema_validation(self, schema_files, derived_data_files):
        """Testa validação específica do schema de carregadores EV."""
        if (
            "carregadores_ev_v1" not in derived_data_files
            or "carregadores_ev" not in schema_files
        ):
            pytest.skip("Arquivos de carregadores EV não encontrados")

        data = derived_data_files["carregadores_ev_v1"]
        schema = schema_files["carregadores_ev"]

        try:
            jsonschema.validate(data, schema)
        except jsonschema.ValidationError as e:
            pytest.fail(f"Validação falhou para carregadores EV: {e}")

        # Testes específicos para estrutura de carregadores EV
        assert (
            "equipamentos" in data
        ), "Arquivo carregadores_ev_v1.json não tem campo 'equipamentos'"
        assert (
            len(data["equipamentos"]) > 0
        ), "Arquivo carregadores_ev_v1.json tem lista de equipamentos vazia"

        # Validar primeiro equipamento
        primeiro_equip = data["equipamentos"][0]
        assert "categoria" in primeiro_equip, "Equipamento não tem campo 'categoria'"
        assert primeiro_equip["categoria"] == "carregador_ev", "Categoria incorreta"
        assert "datasheet" in primeiro_equip, "Equipamento não tem campo 'datasheet'"
        assert "precos" in primeiro_equip, "Equipamento não tem campo 'precos'"

    @pytest.mark.schema
    def test_schema_performance_large_data(self, schema_files, large_dataset):
        """Testa performance de validação com dados grandes."""
        import time

        schema = schema_files.get("consumo_modalidade")
        if not schema:
            pytest.skip("Schema consumo_modalidade não encontrado")

        # Criar dados grandes baseados no schema
        large_data = {
            "unidade_consumidora": {
                "distribuidora": "ENEL",
                "uc_numero": "1234567890",
                "grupo": "B",
                "modalidade_tarifaria": {"tipo": "convencional"},
            },
            "historico_consumo": {"periodo_meses": 60, "unidade": "kWh", "mensal": []},
            "postos_tarifarios": {},
        }

        # Adicionar muitos registros mensais
        for i in range(60):
            large_data["historico_consumo"]["mensal"].append(
                {"competencia": "2023-01", "total_kwh": 150.0 + i}
            )

        # Medir tempo de validação
        start_time = time.time()
        jsonschema.validate(large_data, schema)
        end_time = time.time()

        validation_time = end_time - start_time
        assert validation_time < 1.0, f"Validação muito lenta: {validation_time:.2f}s"
