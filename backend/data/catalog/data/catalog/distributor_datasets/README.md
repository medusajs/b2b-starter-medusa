# 📦 Datasets por Distribuidor

Este diretório contém os **datasets específicos de cada distribuidor**, organizados por fonte de dados. Use estes arquivos quando precisar:

- 🔍 **Análise específica por distribuidor**
- 📊 **Comparação de preços entre fornecedores**
- 🔄 **Atualização de dados de um distribuidor específico**
- 🛠️ **Debugging de problemas de fonte de dados**

---

## 📁 Estrutura dos Diretórios

### `/neosolar/`

- **Fonte**: Portal B2B NeoSolar
- **Produtos**: Inversores, painéis, baterias, kits, acessórios
- **Formato**: JSON processado + CSV original

### `/solfacil/`

- **Fonte**: Loja Solfácil
- **Produtos**: Inversores, painéis, baterias, estruturas, cabos, acessórios
- **Formato**: JSON processado por categoria

### `/odex/`

- **Fonte**: Plataforma ODEX
- **Produtos**: Inversores, painéis, string boxes, estruturas
- **Formato**: JSON processado + documentação MD

### `/fotus/`

- **Fonte**: App FOTUS
- **Produtos**: Kits solares (padrão e híbridos)
- **Formato**: JSON, CSV + schemas + dados extraídos

### `/fortlev/`

- **Fonte**: Portal FortLev Solar
- **Produtos**: Baterias, carregadores EV, dispositivos de segurança
- **Formato**: CSV

### `/raw_csv/`

- **Conteúdo**: Arquivos CSV brutos de web scraping
- **Uso**: Backup e reprocessamento
- **Formato**: CSV com nomes de arquivo baseados em URL

---

## ⚠️ Importante

- **NÃO modifique** estes arquivos diretamente
- Para dados consolidados, use `/unified_schemas/`
- Estes arquivos são **específicos por distribuidor** e podem ter estruturas diferentes
- Sempre consulte os schemas correspondentes antes de processar
