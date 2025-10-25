# 🧪 Instruções de Teste - Dark/Light Mode

## ✅ Status Atual

- **Servidor:** Rodando em <http://localhost:3000>
- **Implementação:** Completa
- **Código:** Zero erros

---

## 🎯 Teste Visual

### **1. Localizar o Toggle**

Procure o ícone no header, posicionado entre o campo de busca e os botões de conta/carrinho:

```
[Logo] [Menu] [Busca] | [☀️/🌙] | [Conta] [Carrinho]
```

### **2. Testar Funcionalidade**

**Light Mode (☀️):**

- Clique no ícone do Sol
- Background deve ficar **preto/cinza escuro**
- Texto deve ficar **branco**
- Botões devem ficar com **amarelo mais claro**
- Ícone muda para 🌙 (Lua)

**Dark Mode (🌙):**

- Clique no ícone da Lua
- Background deve ficar **branco**
- Texto deve ficar **preto**
- Botões devem ficar com **amarelo vibrante**
- Ícone muda para ☀️ (Sol)

### **3. Testar Persistência**

1. Alterne para Dark Mode (🌙)
2. Recarregue a página (F5)
3. O tema deve **permanecer Dark Mode**
4. Alterne para Light Mode (☀️)
5. Recarregue a página (F5)
6. O tema deve **permanecer Light Mode**

---

## 🔍 Checklist Visual Detalhado

### **Light Mode** ✅

| Elemento | Cor Esperada | Hex | Verificado |
|----------|--------------|-----|------------|
| **Background** | Branco | #ffffff | [ ] |
| **Texto Principal** | Preto | #0a0a0a | [ ] |
| **Texto Secundário** | Cinza escuro | #52525b | [ ] |
| **Bordas** | Cinza claro | #e5e7eb | [ ] |
| **Botão Primário** | Amarelo Yello | #FFCE00 | [ ] |
| **Cards** | Branco | #ffffff | [ ] |
| **Shadow** | Sutil | rgba(0,0,0,0.05-0.1) | [ ] |

### **Dark Mode** ✅

| Elemento | Cor Esperada | Hex | Verificado |
|----------|--------------|-----|------------|
| **Background** | Zinc-950 | #09090b | [ ] |
| **Texto Principal** | Branco | #fafafa | [ ] |
| **Texto Secundário** | Cinza claro | #d4d4d8 | [ ] |
| **Bordas** | Zinc-800 | #27272a | [ ] |
| **Botão Primário** | Amarelo claro | #FFD700 | [ ] |
| **Cards** | Zinc-900 | #18181b | [ ] |
| **Shadow** | Forte | rgba(0,0,0,0.3-0.5) | [ ] |

---

## 🧪 Testes Específicos por Componente

### **Buttons**

- [ ] `.ysh-btn-primary` - Gradiente amarelo funciona em ambos os modos
- [ ] `.ysh-btn-secondary` - Azul info se adapta
- [ ] `.ysh-btn-outline` - Borda amarela se adapta
- [ ] Hover states funcionam corretamente

### **Cards**

- [ ] `.ysh-card` - Background e bordas se adaptam
- [ ] `.ysh-card-solar` - Gradiente especial funciona
- [ ] `.ysh-card-glass` - Efeito glass funciona em ambos
- [ ] `.ysh-product-card` - Produtos ficam legíveis

### **Badges**

- [ ] `.ysh-badge-tier-xpp` - Gradiente amarelo-laranja
- [ ] `.ysh-badge-tier-pp` - Azul info
- [ ] `.ysh-badge-tier-p` - Verde success
- [ ] Todos legíveis em ambos os modos

### **Header**

- [ ] Background do header se adapta
- [ ] Logo permanece visível
- [ ] Search input funciona em ambos
- [ ] Toggle ícone está visível e clicável
- [ ] Botões de conta/carrinho visíveis

### **Typography**

- [ ] Títulos (h1, h2, h3) legíveis
- [ ] Texto body legível
- [ ] Links visíveis
- [ ] Texto secundário/muted distinguível

---

## 🐛 Possíveis Problemas

### **Toggle não aparece**

**Sintoma:** Não vejo o ícone ☀️/🌙 no header

**Soluções:**

1. Limpar cache: `Ctrl+Shift+Delete`
2. Hard reload: `Ctrl+F5`
3. Verificar console (F12) para erros
4. Restartar servidor:

   ```powershell
   # Parar servidor (Ctrl+C no terminal)
   yarn dev
   ```

### **Cores não mudam**

**Sintoma:** Clico no toggle mas cores não mudam

**Diagnóstico:**

1. Abrir DevTools (F12)
2. Inspecionar `<html>` element
3. Verificar se classe `dark` é adicionada/removida
4. Verificar console para erros JavaScript

**Solução:**

```javascript
// No console do navegador:
localStorage.getItem('theme') // deve retornar 'light' ou 'dark'

// Se retornar null ou valor errado:
localStorage.setItem('theme', 'dark')
location.reload()
```

### **Tema não persiste**

**Sintoma:** Tema volta para light após reload

**Solução:**

```javascript
// No console do navegador:
// 1. Verificar se localStorage funciona
localStorage.setItem('test', 'works')
localStorage.getItem('test') // deve retornar 'works'

// 2. Se não funcionar, pode ser modo privado do navegador
// Testar em janela normal (não privada)

// 3. Limpar storage e tentar novamente
localStorage.clear()
location.reload()
```

### **Hydration Mismatch**

**Sintoma:** Erro no console sobre hydration

**Causa:** SSR/CSR mismatch (já prevenido no código)

**Solução:**

- Não deveria acontecer (código tem skeleton state)
- Se acontecer, reportar com screenshot do erro

---

## 📊 Teste de Acessibilidade

### **Contraste** (WCAG 2.1 AA)

- [ ] Texto em light mode: ratio ≥ 4.5:1
- [ ] Texto em dark mode: ratio ≥ 4.5:1
- [ ] Botões em ambos os modos: ratio ≥ 3:1

### **Keyboard Navigation**

- [ ] Toggle acessível via Tab
- [ ] Toggle ativável via Enter/Space
- [ ] Foco visível no toggle

### **Screen Reader**

- [ ] Toggle tem aria-label descritivo
- [ ] Estado atual do tema é anunciado

---

## 📱 Teste Responsivo

### **Desktop** (>1024px)

- [ ] Toggle visível e bem posicionado
- [ ] Cores corretas em ambos os modos
- [ ] Sem quebras de layout

### **Tablet** (768px-1024px)

- [ ] Toggle ainda visível
- [ ] Componentes ajustam corretamente
- [ ] Touch target adequado (44×44px mínimo)

### **Mobile** (<768px)

- [ ] Toggle acessível
- [ ] Meta theme-color atualiza (barra do navegador)
- [ ] Performance fluida
- [ ] Sem horizontal scroll

---

## ✅ Critérios de Aceitação

### **Funcional**

- ✅ Toggle alterna entre light/dark
- ✅ Tema persiste após reload
- ✅ Sistema preference funciona como fallback
- ✅ Meta theme-color atualiza

### **Visual**

- ✅ Todas as cores se adaptam
- ✅ Contraste adequado (WCAG AA)
- ✅ Sem elementos invisíveis
- ✅ Transição suave

### **Performance**

- ✅ Zero layout shift
- ✅ Toggle responde instantaneamente
- ✅ Sem flickering/FOUC
- ✅ Build sem erros

### **Documentação**

- ✅ Guia de cores completo
- ✅ Exemplos de uso
- ✅ Troubleshooting guide
- ✅ Código bem comentado

---

## 📝 Reportar Resultados

### **Se Tudo Funcionar** ✅

```markdown
✅ TESTE APROVADO

- [x] Toggle funciona
- [x] Cores se adaptam
- [x] Tema persiste
- [x] Responsivo OK
- [x] Sem erros

Observações: [suas observações]
```

### **Se Houver Problemas** ❌

```markdown
❌ TESTE COM PROBLEMAS

Problema 1: [descrição]
- Passos para reproduzir: [1, 2, 3...]
- Esperado: [comportamento esperado]
- Obtido: [comportamento atual]
- Screenshot: [anexar]

Problema 2: [descrição]
...
```

---

## 🚀 Próximos Passos Após Teste

### **Se Aprovado:**

1. Merge para branch principal
2. Deploy em staging
3. Testes em staging
4. Deploy em produção
5. Monitorar métricas de uso

### **Se Ajustes Necessários:**

1. Documentar problemas
2. Priorizar fixes
3. Implementar correções
4. Re-testar
5. Aprovar novamente

---

**Tempo Estimado de Teste:** 10-15 minutos  
**Última Atualização:** 7 de Outubro, 2025  
**Versão:** 1.0
