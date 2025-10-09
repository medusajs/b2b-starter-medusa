# 🧪 Guia de Teste - Fluxo de Financiamento

**Data:** 8 de Outubro de 2025  
**Objetivo:** Validar o fluxo completo: Tarifas → Viabilidade → Catálogo → Financiamento

---

## ✅ Pré-requisitos

### Serviços Rodando

- ✅ **Backend Medusa**: <http://localhost:9000> (iniciado em nova janela)
- ✅ **Storefront Next.js**: <http://localhost:3000> (rodando)
- ✅ **PostgreSQL**: localhost:15432 (Docker)
- ✅ **Redis**: localhost:16379 (Docker)

### Verificação Rápida

```powershell
# Backend Health
curl http://localhost:9000/health -UseBasicParsing

# Storefront
curl http://localhost:3000 -UseBasicParsing

# Infraestrutura
docker ps --filter "name=postgres-dev"
docker ps --filter "name=redis-dev"
```

---

## 🎯 Cenários de Teste

### 1. Fluxo Completo (Happy Path)

**Objetivo:** Validar o user journey completo de ponta a ponta

#### 1.1 Página de Tarifas

1. Acessar <http://localhost:3000/br/tarifas>
2. Verificar se exibe distribuidoras
3. Selecionar uma distribuidora (ex: CEMIG-D)
4. Verificar se mostra subgrupos tarifários
5. Selecionar subgrupo (ex: B1 - Residencial)
6. Verificar se exibe valores de TUSD e TE
7. Clicar em "Continuar para Dimensionamento"

**✅ Critérios de Sucesso:**

- Dados de tarifas carregam corretamente
- Navegação funciona sem erros
- Dados são persistidos no contexto

#### 1.2 Página de Viabilidade

1. URL deve ser: <http://localhost:3000/br/viabilidade>
2. Verificar se carrega o formulário de dimensionamento
3. Preencher dados:
   - **Endereço**: Av. Afonso Pena, Belo Horizonte, MG
   - **Conta de Luz Atual**: R$ 500,00
   - **Tipo de Consumidor**: Residencial (B1)
   - **Modalidade**: On-grid (Rede Elétrica)
4. Clicar em "Calcular Viabilidade"
5. Verificar se exibe:
   - Potência recomendada (kWp)
   - Geração estimada (kWh/ano)
   - Payback estimado
   - Economia projetada
6. Clicar em "Ver Kits Disponíveis"

**✅ Critérios de Sucesso:**

- Cálculos são executados sem erros
- Resultados fazem sentido (valores realistas)
- Transição para catálogo funciona

#### 1.3 Página de Catálogo

1. URL deve ser: <http://localhost:3000/br/catalogo>
2. Verificar se carrega kits baseados na viabilidade
3. Verificar se exibe:
   - Kits recomendados (filtrados por potência)
   - Detalhes de cada kit (painéis, inversor, potência)
   - Preço de cada kit
   - Botão "Simular Financiamento"
4. Selecionar um kit
5. Clicar em "Simular Financiamento"

**✅ Critérios de Sucesso:**

- Kits são filtrados corretamente (potência compatível)
- Dados do kit incluem todos componentes
- Navegação passa dados corretamente

#### 1.4 Página de Financiamento ✅ NOVA

1. URL deve ser: <http://localhost:3000/br/financiamento?data=><encoded>
2. Verificar se decodifica dados corretamente
3. Verificar se exibe 2 colunas:
   - **Esquerda**: Formulário de entrada
   - **Direita**: Resultados de simulação
4. Verificar formulário pré-preenchido:
   - Investimento total (CAPEX breakdown)
   - Conta atual de luz
   - Economia mensal estimada
   - Potência do sistema (kWp)
   - Geração anual (kWh)
5. Clicar em "Calcular Financiamento"
6. Verificar resultados:
   - Taxas de juros (BACEN ou fallback)
   - 4 cenários de oversizing (114%, 130%, 145%, 160%)
   - Opções de parcelamento (12, 24, 36, 48 meses)
   - ROI display para cada cenário
   - Payback e TIR
7. Verificar resumo executivo:
   - Cenário recomendado destacado
   - Breakdown de investimento
   - Projeção de economia (25 anos)
8. Testar ações:
   - "Baixar Proposta" (download PDF)
   - "Adicionar ao Carrinho"
   - "Nova Simulação"

**✅ Critérios de Sucesso:**

- Decodificação de URL funciona
- Cálculos de ROI são precisos
- Todos cenários são gerados
- Interface é responsiva e clara
- Ações não geram erros (mesmo que incompletas)

---

## 🔍 Testes Específicos

### 2. Integração de Dados

#### 2.1 URL Encoding/Decoding

**Teste Manual no Console do Browser:**

```javascript
// Na página de catálogo, abrir console e testar:
const financeInput = {
  capex: {
    kit: 35000,
    labor: 5000,
    technical_docs: 1000,
    homologation: 800,
    freight: 1200,
    project: 2000
  },
  monthly_bill_brl: 500,
  monthly_savings_brl: 450,
  system_kwp: 8.5,
  annual_generation_kwh: 12000
};

const encoded = btoa(JSON.stringify(financeInput));
console.log('Encoded:', encoded);

const decoded = JSON.parse(atob(encoded));
console.log('Decoded:', decoded);
console.log('Match:', JSON.stringify(financeInput) === JSON.stringify(decoded));
```

**✅ Critério de Sucesso:**

- `Match: true` (codificação reversível)

#### 2.2 BACEN API Integration

**Teste na Página de Financiamento:**

1. Abrir DevTools → Network
2. Recarregar página de financiamento
3. Procurar request para `/api/finance/bacen-rates`
4. Verificar response:

   ```json
   {
     "rates": {
       "selic": 10.75,
       "cdi": 10.65,
       "ipca": 4.5
     },
     "timestamp": "2025-10-08T...",
     "cached": false
   }
   ```

**✅ Critério de Sucesso:**

- Request completa sem erro 500
- Rates retornados são números válidos
- Se BACEN falhar, usa fallback (17.5% a.a.)

#### 2.3 Finance Context State Management

**Teste no Console:**

```javascript
// Verificar se FinanceContext está funcionando
const context = document.querySelector('[data-finance-context]');
console.log('Finance Context:', context);

// Após calcular financiamento, verificar state
// (requer acesso ao React DevTools ou log do componente)
```

**✅ Critério de Sucesso:**

- Context Provider renderiza
- State updates refletem na UI
- Cálculos são consistentes

---

## 🐛 Testes de Edge Cases

### 3. Cenários de Erro

#### 3.1 Dados Inválidos na URL

**Teste:**

1. Acessar: <http://localhost:3000/br/financiamento?data=INVALID_BASE64>
2. Verificar se mostra mensagem de erro
3. Verificar se oferece opção de voltar ao catálogo

**✅ Critério de Sucesso:**

- Não dá erro 500
- Exibe mensagem clara
- Permite navegação

#### 3.2 Valores Extremos

**Teste:**

1. No formulário de financiamento, inserir:
   - CAPEX kit: R$ 0
   - CAPEX kit: R$ 1.000.000
   - Conta de luz: R$ 0
   - Conta de luz: R$ 100.000
2. Calcular financiamento
3. Verificar se valida e mostra alertas

**✅ Critério de Sucesso:**

- Validação funciona
- Mensagens de erro são claras
- Não permite cálculos inválidos

#### 3.3 Backend Offline

**Teste:**

1. Parar o backend: docker-compose down
2. Tentar acessar catálogo
3. Verificar se mostra erro de conexão
4. Reiniciar backend
5. Verificar se reconecta automaticamente

**✅ Critério de Sucesso:**

- Erro de rede é tratado
- Não quebra a aplicação
- Reconexão funciona após restart

---

## 📊 Checklist de Validação

### Funcionalidade

- [ ] **Tarifas**: Carrega e permite seleção
- [ ] **Viabilidade**: Calcula dimensionamento correto
- [ ] **Catálogo**: Filtra kits por potência
- [ ] **Financiamento**: Calcula cenários de ROI
- [ ] **URL Encoding**: Passa dados entre páginas
- [ ] **BACEN API**: Busca taxas de juros
- [ ] **Navegação**: Transições funcionam
- [ ] **Loading States**: Spinners/skeletons exibidos
- [ ] **Error Handling**: Erros tratados graciosamente

### Performance

- [ ] **TTI (Time to Interactive)**: < 3s
- [ ] **Cálculos**: Respondem em < 1s
- [ ] **Transições**: Suaves, sem travamentos
- [ ] **Memory Leaks**: Não aumenta uso de memória

### UX/UI

- [ ] **Layout Responsivo**: Funciona em mobile/tablet/desktop
- [ ] **Acessibilidade**: Navegável por teclado
- [ ] **Feedback Visual**: Botões reagem a hover/click
- [ ] **Mensagens Claras**: Erros são compreensíveis

### Integração

- [ ] **Medusa Backend**: Conecta sem erros
- [ ] **PostgreSQL**: Queries funcionam
- [ ] **Redis**: Cache opera corretamente
- [ ] **BACEN API**: Fallback funciona se falhar

---

## 🚀 Próximos Testes (Após Implementações Futuras)

### 4. Carrinho de Compras (TODO)

- [ ] Adicionar kit com plano de financiamento ao carrinho
- [ ] Verificar se metadata do financiamento é salva
- [ ] Testar checkout com financing metadata
- [ ] Validar criação de pedido no Medusa

### 5. Exportação de Proposta (TODO)

- [ ] Baixar proposta em PDF
- [ ] Verificar se contém todos dados
- [ ] Testar envio por email
- [ ] Validar formatação profissional

### 6. Integração Bancária (TODO)

- [ ] Simular pré-aprovação de crédito
- [ ] Testar API de parceiros bancários
- [ ] Validar análise de crédito
- [ ] Verificar callback de aprovação

---

## 📝 Log de Testes

### Teste 1: [Data/Hora]

**Testador:** [Nome]  
**Browser:** [Chrome/Firefox/Safari]  
**Resultado:** [✅ Passou / ❌ Falhou]

**Observações:**

- [Nota 1]
- [Nota 2]

**Issues Encontradas:**

- [Issue 1]
- [Issue 2]

---

## 🔗 Links Úteis

**Desenvolvimento:**

- Storefront: <http://localhost:3000>
- Backend API: <http://localhost:9000>
- Admin Medusa: <http://localhost:9000/app>

**Páginas do Fluxo:**

- Tarifas: <http://localhost:3000/br/tarifas>
- Viabilidade: <http://localhost:3000/br/viabilidade>
- Catálogo: <http://localhost:3000/br/catalogo>
- Financiamento: <http://localhost:3000/br/financiamento>

**Documentação:**

- Implementação: `./FINANCIAMENTO_IMPLEMENTACAO.md`
- Status Dev: `./DEV_STATUS.md`
- Quick Start: `./GUIA_RAPIDO_INICIALIZACAO.md`

---

## 📞 Suporte

**Em caso de problemas:**

1. Verificar logs do terminal (backend e storefront)
2. Verificar console do browser (F12)
3. Verificar DevTools → Network para API calls
4. Consultar documentação acima
5. Revisar código em `src/modules/financing/`

**Comandos de Debug:**

```powershell
# Ver logs do backend
docker-compose -f docker-compose.dev.yml logs -f medusa

# Ver logs do PostgreSQL
docker-compose -f docker-compose.dev.yml logs -f postgres

# Resetar banco de dados
cd backend
npm run db:reset
npm run seed
npm run seed:catalog

# Rebuild do storefront
cd storefront
npm run build
npm run dev
```

---

**Status:** ✅ Pronto para testes!  
**Última Atualização:** 8 de Outubro de 2025
