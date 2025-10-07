# 🚀 Quick Start - Yello Solar Hub Storefront

## ✅ Pré-requisitos Validados

- [x] Backend rodando em <http://localhost:9000>
- [x] PostgreSQL com 299 produtos
- [x] API key publicável configurada
- [x] Branding Yello aplicado

## 📝 Passos para Iniciar

### 1. Abrir Novo Terminal PowerShell

```powershell
# Windows: Win + X > Windows PowerShell
```

### 2. Navegar para o Storefront

```powershell
cd c:\Users\fjuni\ysh_medusa\medusa-starter\storefront
```

### 3. Verificar .env.local

```powershell
cat .env.local
```

Deve conter:

```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_REGION=br
```

### 4. Iniciar Servidor

```powershell
yarn dev
```

### 5. Aguardar Compilação

```
✓ Starting...
✓ Ready in Xms
○ Compiling /middleware ...
✓ Compiled /middleware in Xms
○ Compiling /[countryCode] ...
✓ Compiled in Xms
```

### 6. Acessar no Navegador

```
http://localhost:3000
```

## 🔍 Validações

### Home Page

- [ ] Logo Yello aparece no header
- [ ] Badge "Marketplace Solar" visível
- [ ] Menu de navegação funcional
- [ ] Produtos aparecem (se houver seção de produtos)

### Página de Produtos

```
http://localhost:3000/br/produtos
```

- [ ] Lista de 299 produtos carrega
- [ ] Imagens aparecem
- [ ] Preços em BRL exibidos
- [ ] Filtros funcionam

### Página de Produto Individual

```
http://localhost:3000/br/products/[handle]
```

- [ ] Detalhes do produto carregam
- [ ] Especificações técnicas aparecem
- [ ] Botão "Adicionar ao carrinho" funcional

### Cotação

```
http://localhost:3000/br/cotacao
```

- [ ] Ícone de cotação no header
- [ ] Contador de itens atualiza
- [ ] Formulário de cotação funcional

## 🐛 Troubleshooting

### Erro: "address already in use :::3000"

```powershell
# Matar processos Node.js
Get-Process node | Stop-Process -Force
```

### Erro: "Module not found"

```powershell
# Limpar e reinstalar
Remove-Item -Recurse -Force .next, node_modules
yarn install
yarn dev
```

### Erro: "Can't resolve '../async-storage/request-store'"

```powershell
# Reinstalar dependências
Remove-Item -Recurse -Force node_modules
yarn install
yarn dev
```

## 📊 Verificar Dados da API

```powershell
# Testar endpoint de produtos
curl.exe -H "x-publishable-api-key: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d" http://localhost:9000/store/products?limit=5
```

## 🎨 Personalizações Aplicadas

- ✅ Logo Yello com gradiente
- ✅ Header "Yello Solar Hub"
- ✅ Footer customizado
- ✅ Cores amber (#fbbf24)
- ✅ Metadata pt-BR

## 📞 Suporte

Se encontrar problemas, verificar:

1. **Backend rodando**: <http://localhost:9000/health>
2. **Produtos no banco**: Ver END_TO_END_VERIFICATION.md
3. **API key válida**: Usar a chave no .env.local

---

**Última Atualização**: 7 de Outubro de 2025
**Status**: ✅ Infraestrutura 100% pronta para uso
