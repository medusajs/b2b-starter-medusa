#  Plano de Consolidação de Repositórios ECR
**Data:** 2025-10-13 12:36:33
**Status:** EM EXECUÇÃO

##  Situação Atual

### Repositórios Backend (DUPLICADOS)
- **ysh-backend** (PRINCIPAL) - 3 imagens (v1.0.4, v1.0.5 + latest)
- **ysh-b2b-backend** (LEGADO) - 6 imagens (v1.0.1, v1.0.2)
- **ysh-b2b/backend** (LEGADO) - 3 imagens (1.0.0 + latest)

### Repositórios Frontend (DUPLICADOS)
- **ysh-b2b-storefront** (VAZIO) - 0 imagens
- **ysh-b2b/storefront** (LEGADO) - 3 imagens (1.0.0 + latest)

##  Decisão: Manter Estrutura Flat

**Repositórios Finais:**
-  **ysh-backend** (mantém - já é o principal)
-  **ysh-storefront** (criar novo)
-  **ysh-b2b-backend** (deprecar)
-  **ysh-b2b/backend** (deprecar)
-  **ysh-b2b-storefront** (deletar - vazio)
-  **ysh-b2b/storefront** (deprecar)

##  Ações Executadas

###  Ação 1: Scan on Push Ativado
Repository: ysh-backend
Status: CONCLUÍDO
Scan automático agora ativo para todas as novas imagens.

###  Ação 2: Limpeza de Imagens
Repository: ysh-backend
Status: NÃO NECESSÁRIO
As 4 imagens 'untagged' são layers de manifest multi-arch.
São referenciadas pelas imagens v1.0.4 e v1.0.5.
NÃO devem ser deletadas.

###  Ação 3: Consolidação (EM ANDAMENTO)

#### Passo 1: Criar repositório ysh-storefront
