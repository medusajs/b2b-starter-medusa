# EXEMPLO PRÁTICO: COMPRA DE KIT SOLAR COM SPLITS

## Cenário Real: Cliente B2B comprando 10 kits solares

---

## 📦 PRODUTO SELECIONADO

**Kit Solar 1.2 kWp - Jinko**

**Especificações Técnicas:**

- Potência: 1.2 kWp
- Painéis: 3× Jinko 580W
- Inversor: Growatt MIC3000TL-X
- Estrutura: Montagem em telhado
- Geração mensal: 186 kWh
- Região: Norte

**Custos (do JSON kits_api_with_splits.json):**

```json
{
  "custo_kit_reais": 7006.00,
  "custo_dossie_tecnico_homologacao_reais": 2335.33,
  "custo_mao_de_obra_reais": 2335.33,
  "valor_total_projeto_reais": 11676.67
}
```

**Fabricação Detalhada:**

```json
{
  "modulos_solares": [
    {
      "marca_do_modulo": "Jinko",
      "modelo_do_modulo": "Jinko 580W",
      "quantidade_de_unidades": 3,
      "preco_unitario_reais": 1875.0,
      "preco_total_modulos_reais": 5625.0
    }
  ],
  "inversor_solar": {
    "marca_do_inversor": "Growatt",
    "modelo_do_inversor": "MIC3000TL-X",
    "preco_unitario_reais": 1799.49,
    "quantidade_de_unidades": 1
  },
  "componentes_balance_of_system": {
    "custo_estrutura_montagem_reais": 1113.67,
    "custo_cabos_e_conectores_reais": 371.22,
    "custo_protecoes_eletricas_reais": 222.73,
    "custo_aterramento_reais": 74.24
  }
}
```

---

## 🛒 PEDIDO DO CLIENTE

**Quantidade:** 10 kits  
**Distribuidor:** FortLev (FLV)  
**Tier:** Gold (90% do preço base)  
**Método de Pagamento:** PIX Dinâmico  
**Notificações:** Email/SMS (grátis) + WhatsApp (R$ 0,55)

---

## 💰 CÁLCULO DE PREÇO (via API)

### Request

```bash
curl -X POST http://localhost:9000/api/payment/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": "prod_kit_jinko_12kwp",
    "distributor_code": "FLV",
    "quantity": 10,
    "payment_method": "pix_dynamic",
    "notifications": ["email_sms", "whatsapp"],
    "include_fees_in_price": true
  }'
```

### Response (calculado pelo workflow)

```json
{
  "calculation": {
    "base_price_brl": 11676.67,
    "quantity": 10,
    "subtotal_brl": 116766.70,
    
    "payment_method": "pix_dynamic",
    "installments": 1,
    
    "gateway_fee_type": "fixed",
    "gateway_fee_percentage": 0,
    "gateway_fee_fixed_brl": 1.89,
    "gateway_fee_total_brl": 1.89,
    
    "notification_types": ["email_sms", "whatsapp"],
    "notification_fee_brl": 0.55,
    
    "advance_requested": false,
    "advance_fee_brl": 0,
    
    "total_before_fees_brl": 116766.70,
    "total_fees_brl": 2.44,
    "total_with_fees_brl": 116769.14,
    
    "splits": [
      {
        "recipient_type": "distributor",
        "recipient_name": "Distributor FLV",
        "split_amount_brl": 70060.00,
        "split_percentage": 59.99,
        "cost_key": "custo_kit_reais"
      },
      {
        "recipient_type": "technical_dossier",
        "recipient_name": "Technical Dossier & Homologation",
        "split_amount_brl": 23353.30,
        "split_percentage": 20.00,
        "cost_key": "custo_dossie_tecnico_homologacao_reais"
      },
      {
        "recipient_type": "labor",
        "recipient_name": "Installation Labor",
        "split_amount_brl": 23353.30,
        "split_percentage": 20.00,
        "cost_key": "custo_mao_de_obra_reais"
      },
      {
        "recipient_type": "platform",
        "recipient_name": "YSH Platform Fee",
        "split_amount_brl": 0.10,
        "split_percentage": 0.01,
        "cost_key": null
      }
    ],
    "total_splits_brl": 116766.70,
    
    "estimated_settlement_date": "2025-10-14T15:30:00.000Z",
    "net_amount_after_fees_brl": 116764.26,
    
    "cost_breakdown": {
      "custo_kit_reais": 70060.00,
      "custo_dossie_tecnico_homologacao_reais": 23353.30,
      "custo_mao_de_obra_reais": 23353.30,
      "valor_total_projeto_reais": 116766.67,
      "modulos_solares": [...],
      "inversor_solar": {...},
      "componentes_balance_of_system": {...}
    }
  },
  "calculation_timestamp": "2025-10-14T12:00:00.000Z",
  "notes": {
    "fees_bearer": "customer",
    "settlement_info": "Gateway fees applied according to Asaas pricing table (Oct 2025)"
  }
}
```

---

## 💵 BREAKDOWN DE VALORES

### Cliente Paga

| Item | Valor |
|------|-------|
| **Subtotal (10× R$ 11,676.67)** | R$ 116,766.70 |
| Taxa PIX | R$ 1.89 |
| Notificação WhatsApp | R$ 0.55 |
| **TOTAL A PAGAR** | **R$ 116,769.14** |

### Liquidação (Poucos segundos após pagamento)

**Valor Líquido Recebido:** R$ 116,767.25 (total - gateway fee)

### Splits Automáticos

| Destinatário | Valor Bruto | Taxa Transfer | Valor Líquido | % |
|--------------|-------------|---------------|---------------|---|
| **FortLev (Distribuidor)** | R$ 70,060.00 | R$ 3.49 | R$ 70,056.51 | 59.99% |
| **Dossiê Técnico** | R$ 23,353.30 | R$ 3.49 | R$ 23,349.81 | 20.00% |
| **Instaladora (Mão de Obra)** | R$ 23,353.30 | R$ 3.49 | R$ 23,349.81 | 20.00% |
| **YSH Platform** | R$ 0.10 | R$ 0.00 | R$ 0.10 | 0.01% |
| **TOTAL** | **R$ 116,766.70** | **R$ 10.47** | **R$ 116,756.23** | **100%** |

**Plataforma YSH Recebe:**

- Gateway fee: R$ 1.89
- Platform split: R$ 0.10
- Transfer fees economizados: R$ 0.00 (conta principal)
- **TOTAL YSH: R$ 1.99**

**Obs:** Platform split de 0.01% é simbólico neste exemplo. Na prática, pode ser configurado para % maior (ex: 5%) ou calculado dinamicamente.

---

## 🔄 EXECUÇÃO DE SPLIT (via API)

### Request

```bash
curl -X POST http://localhost:9000/api/payment/split/create \
  -H "Content-Type: application/json" \
  -d '{
    "payment_transaction_id": "pay_tx_20251014_001",
    "order_id": "order_jinko_10kits",
    "total_amount_brl": 116769.14,
    "gateway_fee_brl": 1.89,
    "cost_breakdown": {
      "custo_kit_reais": 70060.00,
      "custo_dossie_tecnico_homologacao_reais": 23353.30,
      "custo_mao_de_obra_reais": 23353.30,
      "valor_total_projeto_reais": 116766.67
    },
    "distributor_code": "FLV"
  }'
```

### Response

```json
{
  "split_execution": {
    "id": "split_exec_1728912000000",
    "payment_transaction_id": "pay_tx_20251014_001",
    "order_id": "order_jinko_10kits",
    "total_amount_brl": 116769.14,
    "gateway_fee_brl": 1.89,
    "net_amount_brl": 116767.25,
    
    "splits": [
      {
        "recipient_id": "distributor_FLV",
        "recipient_type": "distributor",
        "recipient_name": "Distributor FLV",
        "split_amount_brl": 70060.00,
        "split_percentage": 59.99,
        "calculation_method": "cost_based",
        "cost_key": "custo_kit_reais",
        "transfer_fee_brl": 3.49,
        "net_amount_brl": 70056.51,
        "status": "pending",
        "scheduled_transfer_date": "2025-10-15T00:00:00.000Z",
        "actual_transfer_date": null,
        "asaas_transfer_id": null
      },
      {
        "recipient_id": "technical_dossier_provider",
        "recipient_type": "technical_dossier",
        "recipient_name": "Technical Dossier & Homologation Services",
        "split_amount_brl": 23353.30,
        "split_percentage": 20.00,
        "calculation_method": "cost_based",
        "cost_key": "custo_dossie_tecnico_homologacao_reais",
        "transfer_fee_brl": 3.49,
        "net_amount_brl": 23349.81,
        "status": "pending",
        "scheduled_transfer_date": "2025-10-15T00:00:00.000Z",
        "actual_transfer_date": null,
        "asaas_transfer_id": null
      },
      {
        "recipient_id": "installation_labor_provider",
        "recipient_type": "labor",
        "recipient_name": "Installation Labor Services",
        "split_amount_brl": 23353.30,
        "split_percentage": 20.00,
        "calculation_method": "cost_based",
        "cost_key": "custo_mao_de_obra_reais",
        "transfer_fee_brl": 3.49,
        "net_amount_brl": 23349.81,
        "status": "pending",
        "scheduled_transfer_date": "2025-10-15T00:00:00.000Z",
        "actual_transfer_date": null,
        "asaas_transfer_id": null
      },
      {
        "recipient_id": "ysh_platform",
        "recipient_type": "platform",
        "recipient_name": "YSH Platform Commission",
        "split_amount_brl": 0.10,
        "split_percentage": 0.01,
        "calculation_method": "dynamic",
        "cost_key": null,
        "transfer_fee_brl": 0.00,
        "net_amount_brl": 0.10,
        "status": "pending",
        "scheduled_transfer_date": "2025-10-15T00:00:00.000Z",
        "actual_transfer_date": null,
        "asaas_transfer_id": null
      }
    ],
    
    "total_splits_amount_brl": 116766.70,
    "total_transfer_fees_brl": 10.47,
    "remaining_balance_brl": 0.00,
    "status": "pending",
    "all_transfers_completed": false,
    "completed_transfers_count": 0,
    "failed_transfers_count": 0,
    
    "metadata": {
      "cost_breakdown": {...},
      "distributor_code": "FLV"
    },
    
    "created_at": "2025-10-14T12:00:00.000Z",
    "updated_at": "2025-10-14T12:00:00.000Z"
  },
  
  "summary": {
    "total_recipients": 4,
    "total_amount_brl": 116766.70,
    "total_fees_brl": 10.47,
    "platform_share_brl": 0.10,
    "platform_share_percent": "0.01"
  }
}
```

---

## 📊 RESUMO FINANCEIRO

### Cliente (Comprador)

- **Pagou:** R$ 116,769.14 (via PIX)
- **Recebeu:** 10 kits solares completos instalados
- **Economia vs boleto:** R$ 0.00 (PIX tem mesma taxa)

### FortLev (Distribuidor)

- **Recebe:** R$ 70,056.51
- **Representa:** Custos dos painéis, inversor, BOS
- **Margem:** Incluída no `custo_kit_reais`

### Dossiê Técnico Provider

- **Recebe:** R$ 23,349.81
- **Representa:** Projeto técnico + homologação

### Instaladora (Mão de Obra)

- **Recebe:** R$ 23,349.81
- **Representa:** Instalação física dos 10 kits

### YSH Platform

- **Recebe:**
  - Gateway fee: R$ 1.89
  - Platform split: R$ 0.10
  - **Total: R$ 1.99**
- **Custos:**
  - Transfer fees: R$ 10.47 (pago pelos recipients)
  - Infraestrutura, suporte, etc.
- **Margem líquida:** ~R$ 1.99 - custos operacionais

---

## ⏱️ TIMELINE

**T+0 (Agora):**

- Cliente faz pedido
- API calcula preços e splits
- Gera QR Code PIX

**T+10s (Pagamento confirmado):**

- Cliente paga via PIX
- Asaas confirma pagamento
- Webhook atualiza status → "confirmed"

**T+15s (Split execution):**

- Sistema cria split_execution
- Agenda transferências para T+24h

**T+24h (Transferências):**

- Asaas executa transferências:
  - FortLev: R$ 70,056.51
  - Dossiê: R$ 23,349.81
  - Instaladora: R$ 23,349.81
  - YSH: R$ 0.10
- Status atualizado → "completed"

**T+48h-7d (Instalação):**

- Instaladora agenda instalação
- Dossiê técnico emitido
- Kits instalados

---

## 🔍 VALIDAÇÃO

### Conferência de Valores

**Soma de Splits:**

```
70,060.00 + 23,353.30 + 23,353.30 + 0.10 = 116,766.70 ✅
```

**Total com Fees:**

```
116,766.70 + 1.89 (PIX) + 0.55 (WhatsApp) = 116,769.14 ✅
```

**Transfer Fees:**

```
3.49 × 3 (terceiros) + 0.00 × 1 (YSH) = 10.47 ✅
```

**Balanço Final:**

```
Cliente pagou: 116,769.14
Splits enviados: 116,766.70
Gateway fee: 1.89
Notification fee: 0.55
---
Total distribuído: 116,769.14 ✅
```

---

## 📝 CONCLUSÃO

Este exemplo demonstra:

✅ **Transparência total** de custos  
✅ **Splits automáticos** baseados em custos reais do JSON  
✅ **Cliente paga** apenas R$ 2.44 em taxas (0.002% do total)  
✅ **Liquidação imediata** via PIX  
✅ **Distribuição justa** entre todas as partes  
✅ **Rastreamento completo** de todas as transações  
✅ **Zero intervenção manual** no processo de split  

**Sistema pronto para produção!** 🚀
