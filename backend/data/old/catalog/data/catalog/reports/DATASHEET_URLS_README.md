# URLs de Datasheets - Correções e Verificações

**Data da Atualização:** 08 de Outubro de 2025

## 🔧 Principais Correções Realizadas

### ❌ URL Inválida → ✅ URL Corrigida

#### DEYE (Inversores)

- **Problema:** `www.deyeinverter.com.br` não existe
- **Solução:** Corrigido para `www.deyesolar.com` (site oficial chinês)
- **Downloads:** <https://www.deyesolar.com/index.php/download>
- **Séries:** SUN, SG, KP
- **Nota:** Site brasileiro (.com.br) não está acessível. Usar site global.

#### GROWATT (Inversores)

- **URL Corrigida:** `www.growatt.com`
- **Site BR Alternativo:** `www.ginverter.com`
- **Downloads:** <https://www.growatt.com/show-29-539.html>
- **Séries:** MIN, MIC, MOD

#### SOFAR (Inversores)

- **URL Corrigida:** `www.sofarsolar.com`
- **Site BR:** `br.sofarsolar.com`
- **Downloads:** <https://www.sofarsolar.com/download-center/>
- **Nota:** Centro de downloads unificado

## 📊 Resumo das URLs Verificadas

### Inversores (11 fabricantes com downloads)

| Fabricante | URL Principal | Downloads | Status |
|------------|---------------|-----------|--------|
| **EPEVER** | <www.epever.com> | [Products](https://www.epever.com/products/) | ✅ Verificado |
| **GOODWE** | <www.goodwe.com.br> | [Downloads](https://www.goodwe.com/download) | ✅ Verificado |
| **DEYE** | <www.deyesolar.com> | [Downloads](https://www.deyesolar.com/index.php/download) | ✅ Corrigido |
| **GROWATT** | <www.growatt.com> | [Downloads](https://www.growatt.com/show-29-539.html) | ✅ Verificado |
| **SAJ** | <www.saj-electric.com> | [Products](https://www.saj-electric.com/product/solar-inverter) | ✅ Verificado |
| **ZTROON** 🇧🇷 | <www.ztroon.com.br> | [Produtos](https://www.ztroon.com.br/produtos/) | ✅ Verificado |
| **SOFAR** | <www.sofarsolar.com> | [Downloads](https://www.sofarsolar.com/download-center/) | ✅ Corrigido |
| **HUAWEI** | solar.huawei.com | [Downloads](https://solar.huawei.com/download) | ✅ Verificado |
| **SOLAX** | <www.solaxpower.com> | [Support](https://www.solaxpower.com/support/) | ✅ Verificado |
| **MUST** | <www.must-power.com> | [Downloads](https://www.must-power.com/download/) | ✅ Verificado |
| **ENPHASE** | enphase.com | [Downloads](https://enphase.com/download) | ✅ Verificado |

### Painéis Solares (9 fabricantes com downloads)

| Fabricante | URL Principal | Downloads | Status |
|------------|---------------|-----------|--------|
| **JINKO** | <www.jinkosolar.com> | [Download Center](https://www.jinkosolar.com/en/site/downloadcenter) | ✅ Verificado |
| **LONGI** | <www.longi.com> | [Downloads](https://www.longi.com/en/download/) | ✅ Verificado |
| **ODEX** 🇧🇷 | <www.odex.com.br> | [Painéis](https://www.odex.com.br/paineis-solares/) | ✅ Verificado |
| **ZTROON** 🇧🇷 | <www.ztroon.com.br> | [Módulos](https://www.ztroon.com.br/produtos/modulos-fotovoltaicos/) | ✅ Verificado |
| **OSDA** | <www.osda-solar.com> | [Products](https://www.osda-solar.com/) | ✅ Verificado |
| **ASTRONERGY** | <www.astronergy.com> | [Products](https://www.astronergy.com/product) | ✅ Verificado |
| **HANERSUN** | <www.hanersun.com> | [Products](https://www.hanersun.com/products/) | ✅ Verificado |
| **DAH SOLAR** | <www.dahsolarpv.com> | [Downloads](https://www.dahsolarpv.com/download.html) | ✅ Verificado |
| **MINASOL** 🇧🇷 | minasol.com.br | [Produtos](https://minasol.com.br/produtos/) | ✅ Verificado |

## ⚠️ Observações Importantes

### 1. Links Diretos vs Páginas de Downloads

Muitos fabricantes **não disponibilizam URLs diretas para PDFs** específicos de cada modelo. Nesses casos, as URLs fornecidas levam à:

- Página principal de downloads
- Seção de produtos
- Centro de suporte

O usuário precisa buscar o modelo específico no site do fabricante.

### 2. Sites Brasileiros

Fabricantes marcados com 🇧🇷 são nacionais ou possuem site brasileiro funcional:

- **ZTROON** - Fabricante nacional
- **ODEX** - Distribuidor nacional
- **MINASOL** - Fabricante nacional
- **GOODWE** - Site BR disponível

### 3. Fabricantes Sem Datasheets Públicos

Os seguintes fabricantes não disponibilizam datasheets públicos online:

- K2 SYSTEMS
- TECBOX
- CLAMPER
- SOLAR GROUP
- ROMAGNOLE
- PRATYC
- CHINT POWER
- TSUNESS
- LUXEN
- SUNOVA
- TSUN
- TSUN POWER

**Recomendação:** Solicitar datasheets diretamente aos distribuidores ou representantes.

## 📁 Arquivos Gerados

1. **manufacturers_complete_with_datasheets_fixed.json**
   - Arquivo JSON completo com todas as URLs corrigidas
   - Estrutura: fabricante → website → datasheets (base_url, séries, modelos)

2. **manufacturers_datasheets_fixed_report.txt**
   - Relatório legível em texto com todas as informações
   - Organizado por categoria e fabricante

## 🔍 Como Usar as URLs

### Exemplo 1: Buscar Datasheet por Série

```json
{
  "manufacturer": "DEYE",
  "datasheets": {
    "base_url": "https://www.deyesolar.com/index.php/download",
    "series": {
      "SUN": {
        "datasheet_url": "https://www.deyesolar.com/index.php/download/for-inverter",
        "manual_url": "https://www.deyesolar.com/index.php/download/for-inverter"
      }
    }
  }
}
```

### Exemplo 2: Buscar Datasheet de Modelo Específico

Para modelos como "DEYE SUN5K":

1. Acesse o `base_url` do fabricante
2. Busque pela série "SUN"
3. Localize o modelo específico "SUN5K"

### Exemplo 3: Fabricante Nacional

```json
{
  "manufacturer": "ZTROON",
  "website": {
    "br": "https://www.ztroon.com.br"
  },
  "datasheets": {
    "base_url": "https://www.ztroon.com.br/produtos/",
    "series": {
      "ZT": {
        "datasheet_url": "https://www.ztroon.com.br/produtos/inversores/",
        "manual_url": "https://www.ztroon.com.br/suporte/"
      }
    }
  }
}
```

## 📈 Estatísticas

- **Total de Fabricantes:** 41 (27 inversores + 14 painéis)
- **Com Datasheets/Downloads:** 20 (49%)
- **Sem Informações Públicas:** 21 (51%)
- **Sites Brasileiros Funcionais:** 8
- **URLs Corrigidas:** 3 (DEYE, GROWATT, SOFAR)

## 🎯 Próximos Passos

1. ✅ Validar URLs periodicamente (alguns sites podem mudar)
2. 🔄 Adicionar mais fabricantes conforme disponibilidade
3. 📧 Solicitar parcerias com fabricantes para acesso direto a datasheets
4. 🗂️ Criar repositório local de datasheets importantes
5. 🔗 Implementar sistema de cache para PDFs frequentemente acessados

---

**Última Atualização:** 08/10/2025  
**Responsável:** Sistema de Catalogação YSH  
**Status:** ✅ URLs Verificadas e Funcionais
