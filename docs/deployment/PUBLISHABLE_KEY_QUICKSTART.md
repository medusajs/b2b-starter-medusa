# 🔑 Publishable Key - Setup Rápido

## ⚡ Uso Rápido

### Local (Backend rodando)

```bash
cd backend
npm run setup:publishable-key
```

**Ou com upload para AWS**:

```bash
npm run setup:publishable-key:aws
```

### Docker

```bash
./scripts/setup-publishable-key-menu.sh
# Escolha opção 2
```

### AWS ECS

```bash
./scripts/setup-publishable-key-menu.sh
# Escolha opção 3
```

## 📋 O que acontece?

1. ✅ Verifica se já existe publishable key
2. ✅ Se não existe, cria nova key automaticamente
3. ✅ Linka com Sales Channel padrão (B2B)
4. ✅ Salva em `backend/.env` e `storefront/.env.local`
5. ✅ (Opcional) Faz upload para AWS Secrets Manager

## 🎯 Validar

```bash
# Via script
./scripts/setup-publishable-key-menu.sh
# Escolha opção 4

# Ou manual
curl -H "x-publishable-api-key: $(grep NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY backend/.env | cut -d'=' -f2)" \
     http://localhost:9000/store/products?limit=1
```

## 📚 Documentação Completa

- **Automação**: `docs/deployment/PUBLISHABLE_KEY_AUTOMATION.md`
- **Cobertura 360º**: `docs/deployment/PUBLISHABLE_KEY_360.md`
- **Resumo Executivo**: `docs/deployment/PUBLISHABLE_KEY_EXECUTIVE_SUMMARY.md`

## 🚨 Troubleshooting

### "No publishable key found"

```bash
cd backend
npm run seed
npm run setup:publishable-key
```

### "Backend not running"

```bash
cd backend
npm run dev
# Em outro terminal
npm run setup:publishable-key
```

### Key não funciona

```bash
# Validar
./scripts/setup-publishable-key-menu.sh # Opção 4

# Recriar
cd backend
rm -f .env  # Remover linha da key
npm run setup:publishable-key
```

## 🎉 Pronto

Após executar, você terá:

- ✅ Key configurada localmente
- ✅ Backend funcionando
- ✅ Storefront conectado
- ✅ (Opcional) Key no AWS Secrets Manager
