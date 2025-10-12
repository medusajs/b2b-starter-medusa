# Guia de Testes Visuais - YSH B2B Store

**Data**: 2025-10-12  
**Objetivo**: Testar visualmente UX/UI do Backend Admin vs Storefront

---

## 🎯 URLs de Acesso

### Backend Admin Panel

- **URL**: <http://localhost:9000/app>
- **Credenciais**:
  - Email: `fernando@yellsolarhub.com`
  - Password: `010100Rookie@`
- **Status**: ✅ Backend healthy e rodando

### Storefront (Cliente B2B)

- **URL**: <http://localhost:8000>
- **Status**: ⏳ Corrigindo conflitos de rotas

---

## 🔧 Problemas Resolvidos

### 1. Conflito de Rotas Next.js

**Erro**: `You cannot use different slug names for the same dynamic path ('id' !== 'handle')`

**Causa**: Duas estruturas de rotas conflitantes:

- `products/[handle]/*` (padrão Medusa)
- `produtos/[category]/[id]/*` (customização em português)

**Solução**: Renomeado `produtos` → `catalog-produtos` para evitar conflito

### 2. Pasta Duplicada

**Problema**: `products/[id]` e `products/[handle]` coexistindo

**Solução**: Removida pasta `products/[id]`

---

## 📋 Checklist de Testes Visuais

### Backend Admin Panel (<http://localhost:9000/app>)

#### Login & Dashboard

- [ ] Acesso à tela de login
- [ ] Login com credenciais: <fernando@yellsolarhub.com>
- [ ] Dashboard carrega corretamente
- [ ] Menu lateral visível e funcional
- [ ] Estatísticas/métricas visíveis

#### Gestão de Produtos

- [ ] Listar todos produtos
- [ ] Criar novo produto
- [ ] Editar produto existente
- [ ] Upload de imagens funciona
- [ ] Categorias e coleções disponíveis
- [ ] Variantes de produto funcionam

#### Gestão de Pedidos

- [ ] Listar todos pedidos
- [ ] Visualizar detalhes de pedido
- [ ] Atualizar status de pedido
- [ ] Processar fulfillment
- [ ] Visualizar histórico de pedido

#### Gestão de Clientes

- [ ] Listar clientes
- [ ] Visualizar perfil de cliente
- [ ] Ver histórico de compras
- [ ] Gerenciar endereços

#### B2B - Gestão de Empresas (Custom)

- [ ] Menu "Companies" visível
- [ ] Listar empresas cadastradas
- [ ] Criar nova empresa
- [ ] Editar empresa existente
- [ ] Configurar limites de gastos
- [ ] Ver funcionários da empresa

#### B2B - Gestão de Cotações (Custom)

- [ ] Menu "Quotes" visível
- [ ] Listar cotações pendentes
- [ ] Responder a cotação
- [ ] Converter cotação em pedido
- [ ] Ver mensagens da cotação

#### B2B - Aprovações (Custom)

- [ ] Menu "Approvals" visível
- [ ] Listar aprovações pendentes
- [ ] Configurar workflow de aprovação
- [ ] Ver histórico de aprovações

#### Settings & Configurações

- [ ] Regions disponíveis
- [ ] Currencies configuradas
- [ ] Tax rates visíveis
- [ ] Shipping options listadas
- [ ] Payment providers ativos
- [ ] API keys visíveis
- [ ] Publishable key disponível: `pk_ysh_3e5a854fcf94cfd215e72d1fbfea`

---

### Storefront (<http://localhost:8000>)

#### Home & Navegação

- [ ] Homepage carrega
- [ ] Header com logo e menu
- [ ] Footer com informações
- [ ] Navegação funcional
- [ ] Search bar funciona

#### Catálogo de Produtos

- [ ] Listar produtos
- [ ] Filtros funcionam (categoria, preço, etc)
- [ ] Imagens carregam corretamente
- [ ] Detalhes do produto visíveis
- [ ] Botão "Add to Cart" funciona

#### Carrinho de Compras

- [ ] Adicionar produto ao carrinho
- [ ] Atualizar quantidade
- [ ] Remover produto
- [ ] Ver subtotal e total
- [ ] Aplicar cupom de desconto

#### B2B - Bulk Add to Cart

- [ ] Funcionalidade de adicionar múltiplos produtos
- [ ] Upload de CSV/Excel funciona
- [ ] Validação de quantidades

#### B2B - Request for Quote

- [ ] Botão "Request Quote" visível
- [ ] Formulário de cotação funciona
- [ ] Enviar mensagem funciona
- [ ] Ver histórico de cotações

#### B2B - Approval Workflow

- [ ] Indicador de aprovação necessária
- [ ] Ver status de aprovação
- [ ] Notificações de aprovação
- [ ] Bloqueio de checkout se não aprovado

#### Checkout

- [ ] Formulário de endereço funciona
- [ ] Seleção de shipping funciona
- [ ] Seleção de payment funciona
- [ ] Review order correto
- [ ] Place order funciona

#### Conta do Cliente

- [ ] Login/Register funciona
- [ ] Ver perfil
- [ ] Ver histórico de pedidos
- [ ] Gerenciar endereços
- [ ] Ver empresas (se B2B)

---

## 🎨 Aspectos Visuais a Avaliar

### Design System

- [ ] **Cores**: Consistência da paleta de cores
- [ ] **Tipografia**: Fontes legíveis e hierarquia clara
- [ ] **Espaçamento**: Padding e margins adequados
- [ ] **Botões**: Estados hover/active/disabled funcionam
- [ ] **Forms**: Inputs com labels e validation claros
- [ ] **Icons**: Ícones consistentes e legíveis

### Responsividade

- [ ] **Desktop** (>1200px): Layout otimizado
- [ ] **Tablet** (768px-1200px): Adaptação adequada
- [ ] **Mobile** (<768px): Navegação mobile funcional
- [ ] **Imagens**: Responsive e otimizadas

### UX - Experiência do Usuário

- [ ] **Loading States**: Spinners/skeletons visíveis
- [ ] **Error Messages**: Mensagens claras e úteis
- [ ] **Success Feedback**: Confirmações visíveis
- [ ] **Navigation**: Breadcrumbs e back buttons
- [ ] **Accessibility**: Contrast ratios adequados

---

## 🧪 Cenários de Teste B2B

### Cenário 1: Admin cria nova empresa

1. Login no admin panel
2. Navegar para Companies
3. Criar nova empresa "Test Company"
4. Adicionar limite de gastos: $10,000/mês
5. Criar funcionário associado
6. Verificar no storefront (login como funcionário)

### Cenário 2: Cliente solicita cotação

1. Login no storefront como empresa
2. Adicionar produtos ao carrinho
3. Clicar "Request Quote"
4. Enviar mensagem ao admin
5. Admin responde com preço especial
6. Cliente aceita e converte em pedido

### Cenário 3: Workflow de aprovação

1. Configurar aprovação obrigatória para pedidos > $5,000
2. Funcionário adiciona $6,000 em produtos
3. Tentar checkout (deve ser bloqueado)
4. Manager da empresa aprova
5. Checkout liberado

### Cenário 4: Limite de gastos

1. Empresa tem limite de $10,000/mês
2. Funcionário já gastou $9,500
3. Tentar adicionar produto de $1,000 (deve bloquear)
4. Verificar notificação de limite excedido

---

## 📊 Métricas de Performance

### Backend Admin

- [ ] **Tempo de carregamento inicial**: < 3s
- [ ] **Tempo de listagem (50 produtos)**: < 2s
- [ ] **Tempo de criação de produto**: < 1s
- [ ] **Tempo de upload de imagem**: < 5s

### Storefront

- [ ] **Tempo de carregamento homepage**: < 2s
- [ ] **Tempo de listagem de produtos**: < 1.5s
- [ ] **Tempo de detalhes do produto**: < 1s
- [ ] **Tempo de add to cart**: < 500ms
- [ ] **Tempo de checkout**: < 3s

---

## 🐛 Bugs Conhecidos

### Storefront

1. ⚠️ **Conflito de rotas**: `produtos/[category]/[id]` vs `products/[handle]`
   - **Status**: Corrigido - renomeado para `catalog-produtos`
   - **Teste**: Verificar se ambas rotas funcionam agora

2. ⚠️ **Middleware eval error**: Edge Runtime não suporta eval dinâmico
   - **Status**: Pendente investigação
   - **Workaround**: Mover lógica para API routes

### Backend

1. ⚠️ **Stock Location Module**: Seed script falha por falta do módulo
   - **Status**: Esperado - módulo não configurado
   - **Workaround**: Criar stock locations manualmente via admin

---

## 🔍 Observações & Recomendações

### Pontos Fortes Esperados

- ✅ Backend Medusa 2.10.3 completo e robusto
- ✅ Admin UI moderna e intuitiva
- ✅ B2B features customizadas bem integradas
- ✅ TypeScript strict mode para type safety
- ✅ Workflow engine para automações complexas

### Pontos de Atenção

- ⚠️ Storefront com conflitos de rotas (sendo corrigidos)
- ⚠️ Seed data incompleto (sem produtos de demonstração)
- ⚠️ Custom modules B2B sem migrations (banco vazio)
- ⚠️ Performance não testada sob carga

### Recomendações Imediatas

1. **Completar migrations dos módulos B2B custom**
2. **Criar seed data para demonstração**
3. **Testar todos fluxos B2B end-to-end**
4. **Validar responsividade mobile**
5. **Documentar fluxos de usuário com screenshots**

---

## 📸 Screenshots Recomendados

Para documentação, capturar:

### Backend Admin

1. Dashboard inicial
2. Lista de produtos
3. Detalhes de produto
4. Lista de pedidos
5. Detalhes de pedido
6. Gestão de empresas (B2B)
7. Gestão de cotações (B2B)
8. Configurações de aprovação (B2B)
9. API Keys & Settings

### Storefront

1. Homepage
2. Listagem de produtos
3. Detalhes de produto
4. Carrinho de compras
5. Bulk add to cart (B2B)
6. Request for quote (B2B)
7. Approval workflow (B2B)
8. Checkout flow
9. Conta do cliente
10. Histórico de pedidos

---

## 🚀 Próximos Passos Após Testes Visuais

1. **Documentar todos bugs encontrados**
2. **Criar issues no GitHub para cada bug**
3. **Priorizar correções críticas**
4. **Otimizar performance onde necessário**
5. **Adicionar testes E2E para fluxos críticos**
6. **Preparar para deployment AWS**

---

## 📝 Relatório de Testes (Template)

```markdown
## Teste Visual - [Data]

**Testador**: [Nome]
**Duração**: [Tempo]
**Ambiente**: Local Docker

### Backend Admin
- [ ] Login: ✅/❌
- [ ] Dashboard: ✅/❌
- [ ] Produtos: ✅/❌
- [ ] Pedidos: ✅/❌
- [ ] B2B Features: ✅/❌

### Storefront
- [ ] Homepage: ✅/❌
- [ ] Produtos: ✅/❌
- [ ] Carrinho: ✅/❌
- [ ] Checkout: ✅/❌
- [ ] B2B Features: ✅/❌

### Bugs Encontrados
1. [Descrição do bug]
2. [Descrição do bug]

### Melhorias Sugeridas
1. [Sugestão]
2. [Sugestão]

### Notas Adicionais
[Observações gerais]
```

---

**Status Atual**: ✅ Backend 100% pronto para testes visuais | ⏳ Storefront corrigindo rotas
