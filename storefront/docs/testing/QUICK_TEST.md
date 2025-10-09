# 🧪 Teste Rápido do Dark/Light Mode

## ⚡ Início Rápido (2 minutos)

### **Passo 1: Iniciar o Servidor**

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront
yarn dev
```

### **Passo 2: Abrir no Navegador**

```
http://localhost:3000
```

### **Passo 3: Testar o Toggle**

1. Procure o ícone ☀️ ou 🌙 no header (ao lado do botão de conta)
2. Clique no ícone
3. A página deve alternar entre light/dark
4. Recarregue a página (F5) - o tema deve persistir

---

## ✅ Checklist Visual Rápido

### **Light Mode** (☀️)

- [ ] Background branco
- [ ] Texto preto
- [ ] Botão amarelo vibrante (#FFCE00)
- [ ] Toggle mostra ícone de SOL

### **Dark Mode** (🌙)

- [ ] Background preto/cinza escuro
- [ ] Texto branco
- [ ] Botão amarelo mais claro (#FFD700)
- [ ] Toggle mostra ícone de LUA

---

## 🐛 Problemas Comuns

### **Toggle não aparece?**

```powershell
# Rebuild
yarn build
yarn dev
```

### **Cores não mudam?**

1. Inspecionar elemento (F12)
2. Verificar se `<html>` tem classe `dark`
3. Limpar cache: Ctrl+Shift+Delete

### **Tema não persiste?**

```javascript
// No console do navegador:
localStorage.getItem('theme') // deve retornar 'light' ou 'dark'

// Limpar e testar:
localStorage.clear()
location.reload()
```

---

## 📋 Teste Completo

Veja `THEME_IMPLEMENTATION_SUMMARY.md` para checklist detalhado.

---

**Tempo Estimado:** 2-5 minutos  
**Última Atualização:** 7 de Outubro, 2025
