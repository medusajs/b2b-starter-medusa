# DIAGRAMAS: PAYMENT SYSTEM WITH ASAAS + SPLITS

## 📐 ARQUITETURA DE ALTO NÍVEL

```tsx
┌──tsx─────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ Product Catalog  │  │ Payment Selector │  │ Split Breakdown  │     │
│  │ (Price Display)  │  │ (Method + Tier)  │  │ (Transparency)   │     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘     │
└───────────┼────────────────────┼────────────────────┼─────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         MEDUSA.JS API                                   │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │            /api/payment/calculate (POST)                     │      │
│  │            /api/payment/methods (GET)                        │      │
│  │            /api/payment/split/create (POST)                  │      │
│  │            /api/payment/split/recipients (GET)               │      │
│  └────────────────────────┬─────────────────────────────────────┘      │
└───────────────────────────┼──────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOWS & BUSINESS LOGIC                           │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │      calculatePaymentWithFeesWorkflow (6 Steps)              │      │
│  │  ┌────────────────────────────────────────────────────────┐  │      │
│  │  │ 1. Load Product + Cost Breakdown                       │  │      │
│  │  │ 2. Load Payment Gateway Config                         │  │      │
│  │  │ 3. Calculate Gateway Fees                              │  │      │
│  │  │ 4. Calculate Notification Fees                         │  │      │
│  │  │ 5. Calculate Advance Fees (optional)                   │  │      │
│  │  │ 6. Calculate Payment Splits                            │  │      │
│  │  └────────────────────────────────────────────────────────┘  │      │
│  └──────────────────────────┬───────────────────────────────────┘      │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA MODELS                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │ PaymentGate │  │PaymentTrans │  │SplitRecipien│  │SplitExecution│  │
│  │ way         │  │ action      │  │t            │  │              │  │
│  │ (Fees)      │  │ (Txs)       │  │ (Recipients)│  │ (Repasses)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │
│         │                │                 │                 │          │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐  │
│  │SplitRule    │  │CostBreakdown│  │ Product     │  │ Order       │  │
│  │(Split Logic)│  │(Custos JSON)│  │ Extension   │  │             │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ASAAS API INTEGRATION                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │Create Charge │  │ Webhooks     │  │ Transfers    │  │ Subaccounts│ │
│  │ (Payment)    │  │ (Callbacks)  │  │ (Splits)     │  │ (R$12.90)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 FLUXO DE PAGAMENTO COM SPLITS

```tsx
Cliente                 YSH Platform              Asaas               Recipients
   │                         │                      │                      │
   │ 1. Seleciona produto   │                      │                      │
   │────────────────────────>│                      │                      │
   │                         │                      │                      │
   │ 2. Escolhe PIX         │                      │                      │
   │────────────────────────>│                      │                      │
   │                         │                      │                      │
   │                         │ 3. Calculate Payment │                      │
   │                         │   (Workflow 6 steps) │                      │
   │                         │                      │                      │
   │ 4. Recebe breakdown    │                      │                      │
   │<────────────────────────│                      │                      │
   │   R$ 116,769.14        │                      │                      │
   │   (R$ 116,766.70 base  │                      │                      │
   │    + R$ 1.89 PIX       │                      │                      │
   │    + R$ 0.55 WhatsApp) │                      │                      │
   │                         │                      │                      │
   │ 5. Confirma compra     │                      │                      │
   │────────────────────────>│                      │                      │
   │                         │                      │                      │
   │                         │ 6. Create Charge    │                      │
   │                         │─────────────────────>│                      │
   │                         │                      │                      │
   │                         │ 7. QR Code PIX      │                      │
   │                         │<─────────────────────│                      │
   │                         │                      │                      │
   │ 8. Recebe QR Code      │                      │                      │
   │<────────────────────────│                      │                      │
   │                         │                      │                      │
   │ 9. Escaneia QR + Paga  │                      │                      │
   │────────────────────────────────────────────────>│                      │
   │   R$ 116,769.14        │                      │                      │
   │                         │                      │                      │
   │                         │ 10. Webhook: confirmed                     │
   │                         │<─────────────────────│                      │
   │                         │                      │                      │
   │                         │ 11. Create Split Execution                 │
   │                         │   (4 recipients)     │                      │
   │                         │                      │                      │
   │                         │ 12. Schedule Transfers (T+24h)             │
   │                         │─────────────────────>│                      │
   │                         │                      │                      │
   │                         │                      │ 13. Transfer: R$ 70,056.51
   │                         │                      │─────────────────────>│
   │                         │                      │     (FortLev)        │
   │                         │                      │                      │
   │                         │                      │ 14. Transfer: R$ 23,349.81
   │                         │                      │─────────────────────>│
   │                         │                      │     (Dossier)        │
   │                         │                      │                      │
   │                         │                      │ 15. Transfer: R$ 23,349.81
   │                         │                      │─────────────────────>│
   │                         │                      │     (Labor)          │
   │                         │                      │                      │
   │                         │ 16. Webhooks: transfer_completed           │
   │                         │<─────────────────────│                      │
   │                         │                      │                      │
   │ 17. Recebe confirmação │                      │                      │
   │<────────────────────────│                      │                      │
   │   "Pedido confirmado"  │                      │                      │
   │                         │                      │                      │
```

---

## 🔄 WORKFLOW: calculatePaymentWithFeesWorkflow

```tsx
INPUT                            STEP 1                    STEP 2
┌───────────────┐               ┌───────────────┐         ┌───────────────┐
│product_id     │               │Load Product   │         │Load Gateway   │
│distributor    │──────────────>│+ Cost         │────────>│Config         │
│quantity       │               │Breakdown      │         │(Asaas Fees)   │
│payment_method │               └───────────────┘         └───────────────┘
│notifications  │                       │                         │
└───────────────┘                       ▼                         ▼
                              {product, cost_breakdown}  {gateway_config}
                                       │                         │
                                       └────────┬────────────────┘
                                                │
                                                ▼
                                    STEP 3: Calculate Gateway Fees
                                    ┌─────────────────────────┐
                                    │ IF boleto: R$ 1.89      │
                                    │ IF credit_card:         │
                                    │   1x: 2.89%             │
                                    │   2-6x: 3.12%           │
                                    │   7-12x: 3.44%          │
                                    │   13-21x: 5.58%         │
                                    │ IF debit_card: 1.89%    │
                                    │ IF pix: R$ 1.89         │
                                    └────────┬────────────────┘
                                             │
                                             ▼
                                    STEP 4: Calculate Notification Fees
                                    ┌─────────────────────────┐
                                    │ email_sms: R$ 0.00      │
                                    │ whatsapp: R$ 0.55       │
                                    │ voice_robot: R$ 0.55    │
                                    │ mail: R$ 2.91           │
                                    └────────┬────────────────┘
                                             │
                                             ▼
                                    STEP 5: Calculate Advance Fees (optional)
                                    ┌─────────────────────────┐
                                    │ IF enable_advance:      │
                                    │   boleto: 4.19%/mês     │
                                    │   credit: 1.89%/mês     │
                                    │ ELSE: 0                 │
                                    └────────┬────────────────┘
                                             │
                                             ▼
                                    STEP 6: Calculate Splits
                                    ┌─────────────────────────┐
                                    │ 1. Distributor          │
                                    │    = custo_kit_reais    │
                                    │ 2. Dossier              │
                                    │    = custo_dossie       │
                                    │ 3. Labor                │
                                    │    = custo_mao_de_obra  │
                                    │ 4. Platform             │
                                    │    = Remainder (~5%)    │
                                    └────────┬────────────────┘
                                             │
                                             ▼
                                    OUTPUT
                                    ┌─────────────────────────┐
                                    │ total_with_fees_brl     │
                                    │ gateway_fee_total_brl   │
                                    │ splits[] (4 recipients) │
                                    │ total_splits_brl        │
                                    │ estimated_settlement    │
                                    │ cost_breakdown          │
                                    └─────────────────────────┘
```

---

## 💸 SPLIT DISTRIBUTION (Visual)

```tsx
                    CLIENTE PAGA: R$ 116,769.14
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Gateway Fee          Valor Líquido
               R$ 1.89            R$ 116,767.25
                    │                   │
                    ▼                   │
              YSH Platform              │
             (absorve fee)              │
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        │    SPLITS BASEADOS EM CUSTOS  │
                        │                               │
                        └───────────┬───────────────────┘
                                    │
                ┌───────────────────┼───────────────────┬───────────────────┐
                │                   │                   │                   │
                ▼                   ▼                   ▼                   ▼
        ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐
        │ DISTRIBUTOR  │    │   DOSSIER    │    │    LABOR     │  │   PLATFORM   │
        │  (FortLev)   │    │  (Technical) │    │(Installation)│  │     (YSH)    │
        └──────────────┘    └──────────────┘    └──────────────┘  └──────────────┘
              │                     │                   │                   │
        R$ 70,060.00          R$ 23,353.30        R$ 23,353.30         R$ 0.10
        (59.99%)              (20.00%)            (20.00%)             (0.01%)
              │                     │                   │                   │
        - R$ 3.49             - R$ 3.49           - R$ 3.49           - R$ 0.00
        (transfer)            (transfer)          (transfer)          (conta principal)
              │                     │                   │                   │
              ▼                     ▼                   ▼                   ▼
        R$ 70,056.51          R$ 23,349.81        R$ 23,349.81         R$ 0.10
        (LÍQUIDO)             (LÍQUIDO)           (LÍQUIDO)            (LÍQUIDO)
```

**Total Distribuído:**

- Soma de splits: R$ 116,766.70 ✅
- Gateway fee (YSH): R$ 1.89
- Notification fee: R$ 0.55
- **TOTAL: R$ 116,769.14** ✅

**Transfer Fees (pagas pelos recipients):**

- 3× R$ 3.49 = R$ 10.47 (para Asaas)

---

## 🗄️ DATABASE SCHEMA (Simplified)

```tsx
┌─────────────────────────────────┐
│      payment_gateway            │
├─────────────────────────────────┤
│ id                    PK        │
│ gateway_provider      VARCHAR   │──> "asaas"
│ environment           VARCHAR   │──> "production"
│ boleto_fee_brl        DECIMAL   │──> 1.89
│ credit_card_fee_*     DECIMAL   │──> 2.89, 3.12, 3.44, 5.58
│ pix_dynamic_fee_brl   DECIMAL   │──> 1.89
│ whatsapp_fee_brl      DECIMAL   │──> 0.55
│ ...                              │
└─────────────────────────────────┘
              │
              │ (1:N)
              ▼
┌─────────────────────────────────┐
│      payment_transaction        │
├─────────────────────────────────┤
│ id                    PK        │
│ payment_gateway_id    FK        │────> payment_gateway.id
│ order_id              VARCHAR   │
│ payment_method        ENUM      │──> boleto, credit_card, pix
│ amount_brl            DECIMAL   │──> 116769.14
│ gateway_fee_brl       DECIMAL   │──> 1.89
│ total_with_fees_brl   DECIMAL   │──> 116769.14
│ asaas_charge_id       VARCHAR   │──> "chrg_xyz123"
│ status                ENUM      │──> pending, confirmed, received
│ ...                              │
└─────────────────────────────────┘
              │
              │ (1:1)
              ▼
┌─────────────────────────────────┐
│    payment_split_execution      │
├─────────────────────────────────┤
│ id                    PK        │
│ payment_transaction_id FK       │────> payment_transaction.id
│ total_amount_brl      DECIMAL   │──> 116769.14
│ gateway_fee_brl       DECIMAL   │──> 1.89
│ net_amount_brl        DECIMAL   │──> 116767.25
│ splits                JSON      │──> [{recipient, amount, fee, ...}, ...]
│ total_splits_brl      DECIMAL   │──> 116766.70
│ total_transfer_fees   DECIMAL   │──> 10.47
│ status                ENUM      │──> pending, completed
│ ...                              │
└─────────────────────────────────┘
              │
              │ (N:M via splits JSON)
              ▼
┌─────────────────────────────────┐
│   payment_split_recipient       │
├─────────────────────────────────┤
│ id                    PK        │
│ recipient_type        ENUM      │──> distributor, labor, platform
│ recipient_code        VARCHAR   │──> FLV, NEO, FTS
│ recipient_name        VARCHAR   │──> "FortLev Solar"
│ asaas_account_id      VARCHAR   │──> "acc_xyz456"
│ pix_key               VARCHAR   │──> "12345678000190"
│ pix_key_type          ENUM      │──> cnpj, cpf, email, phone
│ transfer_fee_brl      DECIMAL   │──> 3.49 (terceiros), 0.00 (YSH)
│ active                BOOLEAN   │──> true
│ ...                              │
└─────────────────────────────────┘
```

---

## 📊 COST BREAKDOWN STRUCTURE

```json
{
  "product_id": "prod_kit_jinko_12kwp",
  "distributor_code": "FLV",
  
  "custo_kit_reais": 70060.00,
  "custo_dossie_tecnico_homologacao_reais": 23353.30,
  "custo_mao_de_obra_reais": 23353.30,
  "valor_total_projeto_reais": 116766.67,
  
  "modulos_solares": [
    {
      "marca_do_modulo": "Jinko",
      "modelo_do_modulo": "Jinko 580W",
      "quantidade_de_unidades": 30,
      "preco_unitario_reais": 1875.0,
      "preco_total_modulos_reais": 56250.0
    }
  ],
  
  "inversor_solar": {
    "marca_do_inversor": "Growatt",
    "modelo_do_inversor": "MIC3000TL-X",
    "preco_unitario_reais": 1799.49,
    "quantidade_de_unidades": 10
  },
  
  "componentes_balance_of_system": {
    "custo_estrutura_montagem_reais": 11136.70,
    "custo_cabos_e_conectores_reais": 3712.20,
    "custo_protecoes_eletricas_reais": 2227.30,
    "custo_aterramento_reais": 742.40
  }
}
```

**Split Mapping:**

- `custo_kit_reais` → **Distributor** (FortLev)
- `custo_dossie_tecnico_homologacao_reais` → **Technical Dossier Provider**
- `custo_mao_de_obra_reais` → **Labor Provider** (Instaladora)
- Remainder → **Platform** (YSH)

---

## ⚡ PAYMENT METHOD COMPARISON

```tsx
┌────────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│    Method      │     Fee      │  Settlement  │   Advance    │ Installments │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Boleto         │ R$ 1.89      │ 1 day        │ 4.19%/month  │ No           │
│                │ (fixed)      │              │ (2-3 days)   │              │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Credit Card    │ 2.89%-5.58%  │ 30 days      │ 1.89%/month  │ Yes (1-21x)  │
│ (1x)           │ 2.89%        │              │ (2-3 days)   │              │
│ (2-6x)         │ 3.12%        │              │              │              │
│ (7-12x)        │ 3.44%        │              │              │              │
│ (13-21x)       │ 5.58%        │              │              │              │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Debit Card     │ 1.89%        │ 3 days       │ N/A          │ No           │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ PIX Dynamic    │ R$ 1.89      │ ~10 seconds  │ N/A          │ No           │
│                │ (fixed)      │              │              │              │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ PIX Static     │ R$ 1.89      │ ~10 seconds  │ N/A          │ No           │
│                │ (fixed)      │              │              │              │
└────────────────┴──────────────┴──────────────┴──────────────┴──────────────┘

                    ⭐ RECOMMENDED: PIX (fastest, lowest fee)
```

---

## 🎯 CONCLUSION

Estes diagramas ilustram:

✅ **Arquitetura em camadas** (Frontend → API → Workflows → Models → Asaas)  
✅ **Fluxo completo** de pagamento (17 steps, cliente → YSH → Asaas → Recipients)  
✅ **Workflow detalhado** com 6 steps independentes  
✅ **Split distribution** visual com valores reais  
✅ **Database schema** simplificado  
✅ **Cost breakdown** mapping para splits  
✅ **Payment methods** comparison table  

**Sistema Production-Ready com Transparência Total!** 🚀
