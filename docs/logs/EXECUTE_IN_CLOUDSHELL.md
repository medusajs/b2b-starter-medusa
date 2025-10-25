# Obter Logs Task v12 - EXECUTAR NO CLOUDSHELL

⚠️ **IMPORTANTE**: PowerShell corrompe caracteres especiais do CloudWatch Logs. Execute este comando no **AWS CloudShell**.

## Task v12 - Task ID: 9d9f144aef0d4ed8b753aaa7723fe047

### Passo 1: Acessar CloudShell

1. Abrir AWS Console → <https://console.aws.amazon.com/>
2. Clicar no ícone de terminal no canto superior direito
3. Aguardar CloudShell inicializar

### Passo 2: Executar Comando

```bash
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/9d9f144aef0d4ed8b753aaa7723fe047" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

### Passo 3: Procurar por Indicadores de Erro

**Palavras-chave para buscar:**

- `SELF_SIGNED_CERT_IN_CHAIN` - Erro SSL persistente
- `Error:` - Qualquer erro Node.js
- `ECONNREFUSED` - Falha de conexão
- `Cannot find module` - Erro de dependência
- `DATABASE_SSL` - Referências à configuração SSL

### Comparação com v11

Task v11 mostrou:

```
error: self-signed certificate in certificate chain
    at TLSSocket.onConnectSecure (node:_tls_wrap:1674:34)
    ...
    code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

**Se v12 mostrar o mesmo erro**, significa que `DATABASE_SSL` environment variables não foram suficientes e precisamos de uma abordagem diferente.

**Se v12 mostrar erro diferente**, significa que a configuração SSL introduziu novo problema.

## Task v12 Alternativa (caso primeira falhar)

Task ID: 192aa85d0d6349438d4b2c4405b0a5d0 (stopped 2025-10-12T15:17:34)

```bash
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/192aa85d0d6349438d4b2c4405b0a5d0" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

## Após Obter Logs

Cole a saída completa do comando aqui para análise e determinação do próximo passo.

---

## Status Atual

- **Task Definition**: v12
- **Image**: v1.0.2 (digest: sha256:1823473b3ea1b4d2ec02cdd8935658153af1a3ba21f7f23b1757074b01fbcab7)
- **SSL Config**:
  - `DATABASE_SSL=true`
  - `DATABASE_SSL_REJECT_UNAUTHORIZED=true`
  - `DATABASE_SSL_CA_FILE=/tmp/rds-ca-bundle.pem`
  - `NODE_EXTRA_CA_CERTS=/tmp/rds-ca-bundle.pem`
- **CA Bundle**: Downloaded in Dockerfile from <https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem>
- **Status**: 0/2 healthy tasks, both failed with exit code 1
