# 🎨 Sistema de Cores Dark/Light Mode - Yello Solar Hub

**Data:** 7 de Outubro, 2025  
**Versão:** 2.0 (Theme Aware)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [CSS Variables](#css-variables)
3. [Uso em Componentes](#uso-em-componentes)
4. [Tabela de Cores](#tabela-de-cores)
5. [Exemplos Práticos](#exemplos-práticos)

---

## 🌓 Visão Geral

O sistema de cores do YSH agora suporta **dark mode** completo com transição automática baseada em:

- Preferência do usuário (localStorage)
- Preferência do sistema (media query `prefers-color-scheme`)
- Toggle manual via componente `ThemeToggle`

### **Princípios de Design**

**Light Mode:**

- Fundo branco puro (#ffffff)
- Texto escuro para alto contraste
- Cores vibrantes da marca Yello
- Sombras sutis

**Dark Mode:**

- Fundo zinc-950 (#09090b)
- Texto claro para conforto visual
- Cores mais vibrantes para compensar fundo escuro
- Sombras mais intensas

---

## 🎨 CSS Variables

Todas as cores usam **CSS Custom Properties** para suportar temas dinâmicos.

### **Background & Surfaces**

| Variable | Light Mode | Dark Mode | Uso |
|----------|------------|-----------|-----|
| `--bg` | `#ffffff` | `#09090b` (zinc-950) | Background principal |
| `--surface` | `#ffffff` | `#18181b` (zinc-900) | Cards, containers |
| `--surface-elevated` | `#fafafa` | `#27272a` (zinc-800) | Cards elevados |
| `--surface-hover` | `#f8f9fa` | `#3f3f46` (zinc-700) | Hover states |

### **Text Colors**

| Variable | Light Mode | Dark Mode | Uso |
|----------|------------|-----------|-----|
| `--fg` | `#0a0a0a` (zinc-950) | `#fafafa` (zinc-50) | Texto primário |
| `--fg-secondary` | `#52525b` (zinc-600) | `#d4d4d8` (zinc-300) | Texto secundário |
| `--fg-tertiary` | `#71717a` (zinc-500) | `#a1a1aa` (zinc-400) | Texto terciário |
| `--fg-muted` | `#a1a1aa` (zinc-400) | `#71717a` (zinc-500) | Texto muted |

### **Border Colors**

| Variable | Light Mode | Dark Mode | Uso |
|----------|------------|-----------|-----|
| `--border` | `#e5e7eb` (gray-200) | `#27272a` (zinc-800) | Bordas padrão |
| `--border-strong` | `#d4d4d8` (zinc-300) | `#3f3f46` (zinc-700) | Bordas fortes |
| `--border-hover` | `#a1a1aa` (zinc-400) | `#52525b` (zinc-600) | Bordas hover |

### **Brand Colors**

| Variable | Light Mode | Dark Mode | Uso |
|----------|------------|-----------|-----|
| `--brand-primary` | `#FFCE00` | `#FFD700` ⬆️ | Amarelo Yello |
| `--brand-primary-hover` | `#E6B800` | `#FFE44D` ⬆️ | Hover amarelo |
| `--brand-primary-active` | `#CC9900` | `#FFED99` ⬆️ | Active amarelo |
| `--brand-secondary` | `#FF6600` | `#FF7722` ⬆️ | Laranja Yello |
| `--brand-accent` | `#FF0066` | `#FF3388` ⬆️ | Magenta Yello |

> **⬆️ = Mais vibrante no dark mode** para compensar fundo escuro

### **Semantic Colors**

| Variable | Light Mode | Dark Mode | Background Light | Background Dark |
|----------|------------|-----------|------------------|-----------------|
| `--success` | `#00AA44` | `#00CC55` ⬆️ | `#E6F9EE` | `#0a2818` |
| `--warning` | `#FFAA00` | `#FFBB33` ⬆️ | `#FFF3CD` | `#2a2410` |
| `--error` | `#DC3545` | `#FF5566` ⬆️ | `#FFF5F5` | `#2a1015` |
| `--info` | `#0066CC` | `#3399FF` ⬆️ | `#E6F3FF` | `#0a1a2a` |

### **Glass Morphism**

| Variable | Light Mode | Dark Mode | Uso |
|----------|------------|-----------|-----|
| `--glass-bg` | `rgba(255,255,255,0.65)` | `rgba(24,24,27,0.55)` | Background glass |
| `--glass-border` | `rgba(0,0,0,0.08)` | `rgba(250,250,250,0.08)` | Borda glass |
| `--glass-shadow` | `rgba(31,38,135,0.15)` | `rgba(0,0,0,0.45)` | Sombra glass |

### **Shadows**

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | `0 4px 6px rgba(0,0,0,0.4)` |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | `0 10px 15px rgba(0,0,0,0.5)` |

---

## 💻 Uso em Componentes

### **1. CSS Classes (Recomendado)**

```css
.meu-componente {
  background-color: var(--surface);
  color: var(--fg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}

.meu-componente:hover {
  background-color: var(--surface-hover);
  border-color: var(--border-hover);
}
```

### **2. Tailwind + CSS Variables**

```tsx
<div className="bg-[var(--surface)] text-[var(--fg)] border border-[var(--border)]">
  Conteúdo
</div>
```

### **3. Classes Pré-definidas**

```tsx
// Botões
<button className="ysh-btn-primary">Primário</button>
<button className="ysh-btn-secondary">Secundário</button>
<button className="ysh-btn-outline">Outline</button>

// Cards
<div className="ysh-card">Card Padrão</div>
<div className="ysh-card-solar">Card Solar</div>
<div className="ysh-card-glass">Card Glass</div>

// Badges
<span className="ysh-badge-tier-xpp">X++</span>
<span className="ysh-badge-tier-pp">PP</span>
```

---

## 🔧 Hook useTheme

```tsx
import { useTheme } from '@/lib/hooks/useTheme'

function MeuComponente() {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div>
      <p>Tema atual: {theme}</p>
      <button onClick={toggleTheme}>Alternar Tema</button>
      <button onClick={() => setTheme('dark')}>Forçar Dark</button>
      <button onClick={() => setTheme('light')}>Forçar Light</button>
    </div>
  )
}
```

---

## 🎨 Componente ThemeToggle

```tsx
import { ThemeToggle } from '@/components/theme'

function Header() {
  return (
    <header>
      <nav>
        {/* Seus links */}
      </nav>
      <ThemeToggle />
    </header>
  )
}
```

**Características:**

- ✅ Ícone Sol/Lua animado
- ✅ Tooltip acessível
- ✅ Transição suave
- ✅ Cores temáticas (amarelo no light, amarelo no dark)
- ✅ Sem hydration mismatch

---

## 📊 Tabela de Cores Completa

### **Light Mode**

| Elemento | CSS Variable | Hex | Visual |
|----------|--------------|-----|--------|
| **Background Principal** | `--bg` | `#ffffff` | ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) |
| **Surface Card** | `--surface` | `#ffffff` | ![#ffffff](https://via.placeholder.com/15/ffffff/000000?text=+) |
| **Texto Primário** | `--fg` | `#0a0a0a` | ![#0a0a0a](https://via.placeholder.com/15/0a0a0a/ffffff?text=+) |
| **Texto Secundário** | `--fg-secondary` | `#52525b` | ![#52525b](https://via.placeholder.com/15/52525b/ffffff?text=+) |
| **Borda** | `--border` | `#e5e7eb` | ![#e5e7eb](https://via.placeholder.com/15/e5e7eb/000000?text=+) |
| **Amarelo Yello** | `--brand-primary` | `#FFCE00` | ![#FFCE00](https://via.placeholder.com/15/FFCE00/000000?text=+) |
| **Laranja Yello** | `--brand-secondary` | `#FF6600` | ![#FF6600](https://via.placeholder.com/15/FF6600/ffffff?text=+) |
| **Magenta Yello** | `--brand-accent` | `#FF0066` | ![#FF0066](https://via.placeholder.com/15/FF0066/ffffff?text=+) |
| **Success** | `--success` | `#00AA44` | ![#00AA44](https://via.placeholder.com/15/00AA44/ffffff?text=+) |
| **Warning** | `--warning` | `#FFAA00` | ![#FFAA00](https://via.placeholder.com/15/FFAA00/000000?text=+) |
| **Error** | `--error` | `#DC3545` | ![#DC3545](https://via.placeholder.com/15/DC3545/ffffff?text=+) |
| **Info** | `--info` | `#0066CC` | ![#0066CC](https://via.placeholder.com/15/0066CC/ffffff?text=+) |

### **Dark Mode**

| Elemento | CSS Variable | Hex | Visual |
|----------|--------------|-----|--------|
| **Background Principal** | `--bg` | `#09090b` | ![#09090b](https://via.placeholder.com/15/09090b/ffffff?text=+) |
| **Surface Card** | `--surface` | `#18181b` | ![#18181b](https://via.placeholder.com/15/18181b/ffffff?text=+) |
| **Texto Primário** | `--fg` | `#fafafa` | ![#fafafa](https://via.placeholder.com/15/fafafa/000000?text=+) |
| **Texto Secundário** | `--fg-secondary` | `#d4d4d8` | ![#d4d4d8](https://via.placeholder.com/15/d4d4d8/000000?text=+) |
| **Borda** | `--border` | `#27272a` | ![#27272a](https://via.placeholder.com/15/27272a/ffffff?text=+) |
| **Amarelo Yello** | `--brand-primary` | `#FFD700` ⬆️ | ![#FFD700](https://via.placeholder.com/15/FFD700/000000?text=+) |
| **Laranja Yello** | `--brand-secondary` | `#FF7722` ⬆️ | ![#FF7722](https://via.placeholder.com/15/FF7722/000000?text=+) |
| **Magenta Yello** | `--brand-accent` | `#FF3388` ⬆️ | ![#FF3388](https://via.placeholder.com/15/FF3388/ffffff?text=+) |
| **Success** | `--success` | `#00CC55` ⬆️ | ![#00CC55](https://via.placeholder.com/15/00CC55/000000?text=+) |
| **Warning** | `--warning` | `#FFBB33` ⬆️ | ![#FFBB33](https://via.placeholder.com/15/FFBB33/000000?text=+) |
| **Error** | `--error` | `#FF5566` ⬆️ | ![#FF5566](https://via.placeholder.com/15/FF5566/000000?text=+) |
| **Info** | `--info` | `#3399FF` ⬆️ | ![#3399FF](https://via.placeholder.com/15/3399FF/000000?text=+) |

---

## 💡 Exemplos Práticos

### **Exemplo 1: Product Card**

```tsx
function ProductCard({ product }) {
  return (
    <div className="ysh-product-card p-4">
      <img src={product.image} alt={product.name} />
      <h3 style={{ color: 'var(--fg)' }}>{product.name}</h3>
      <p style={{ color: 'var(--fg-secondary)' }}>{product.description}</p>
      <div className="ysh-price">{product.price}</div>
      <button className="ysh-btn-primary">Adicionar ao Carrinho</button>
    </div>
  )
}
```

**Resultado:**

- **Light:** Card branco, texto preto, botão amarelo vibrante
- **Dark:** Card zinc-900, texto branco, botão amarelo mais claro

---

### **Exemplo 2: Alert Contextual**

```tsx
function Alert({ type, children }) {
  return (
    <div
      style={{
        backgroundColor: `var(--${type}-bg)`,
        borderLeft: `4px solid var(--${type})`,
        padding: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      <p style={{ color: 'var(--fg)' }}>{children}</p>
    </div>
  )
}

// Uso
<Alert type="success">Sistema solar instalado com sucesso!</Alert>
<Alert type="warning">Estoque baixo para este produto.</Alert>
<Alert type="error">Falha ao processar pagamento.</Alert>
<Alert type="info">Novo produto disponível no catálogo.</Alert>
```

---

### **Exemplo 3: Tier Badge**

```tsx
function TierBadge({ tier }) {
  const tierClasses = {
    'xpp': 'ysh-badge-tier-xpp',
    'pp': 'ysh-badge-tier-pp',
    'p': 'ysh-badge-tier-p',
    'm': 'ysh-badge-tier-m',
    'g': 'ysh-badge-tier-g',
  }
  
  return <span className={tierClasses[tier]}>{tier.toUpperCase()}</span>
}
```

**Resultado:**

- **Light:** Gradiente amarelo-laranja vibrante
- **Dark:** Mesmo gradiente mas mais luminoso

---

### **Exemplo 4: Glass Card**

```tsx
function GlassCard({ children }) {
  return (
    <div className="ysh-card-glass p-6">
      {children}
    </div>
  )
}
```

**Resultado:**

- **Light:** Fundo branco translúcido com blur
- **Dark:** Fundo zinc-900 translúcido com blur

---

## 🎯 Melhores Práticas

### ✅ **Fazer**

1. **Sempre use CSS variables** para cores

   ```css
   color: var(--fg);
   background: var(--surface);
   ```

2. **Use classes pré-definidas** quando possível

   ```tsx
   <button className="ysh-btn-primary">Ação</button>
   ```

3. **Teste em ambos os modos** antes de deploy
   - Light mode
   - Dark mode
   - Transição entre modos

4. **Use cores semânticas** para feedback

   ```tsx
   <span style={{ color: 'var(--success)' }}>✓ Sucesso</span>
   <span style={{ color: 'var(--error)' }}>✗ Erro</span>
   ```

### ❌ **Evitar**

1. **Cores hardcoded**

   ```css
   /* ❌ Ruim */
   color: #000000;
   background: #ffffff;
   
   /* ✅ Bom */
   color: var(--fg);
   background: var(--bg);
   ```

2. **Estilos inline sem CSS variables**

   ```tsx
   {/* ❌ Ruim */}
   <div style={{ color: '#000' }}>Texto</div>
   
   {/* ✅ Bom */}
   <div style={{ color: 'var(--fg)' }}>Texto</div>
   ```

3. **Assumir tema fixo**

   ```tsx
   {/* ❌ Ruim - só funciona no light */}
   <div className="bg-white text-black">...</div>
   
   {/* ✅ Bom - funciona em ambos */}
   <div className="bg-[var(--surface)] text-[var(--fg)]">...</div>
   ```

---

## 🚀 Próximos Passos

### **Implementação Imediata**

1. ✅ **ThemeToggle no Header**

   ```tsx
   import { ThemeToggle } from '@/components/theme'
   
   function Header() {
     return (
       <header>
         {/* ... */}
         <ThemeToggle />
       </header>
     )
   }
   ```

2. ✅ **Migrar componentes existentes** para usar CSS variables

3. ✅ **Testar todas as páginas** em dark mode

### **Melhorias Futuras**

- [ ] Adicionar mais variantes de cards (success, warning, error)
- [ ] Criar componente `ColorSwatch` para documentação viva
- [ ] Implementar transitions suaves entre temas
- [ ] Adicionar suporte a temas customizados (high contrast, daltonismo)

---

## 📚 Referências

- **Design System:** `/src/lib/design-system/colors.ts`
- **Global Styles:** `/src/styles/globals.css`
- **ThemeToggle:** `/src/components/theme/ThemeToggle.tsx`
- **useTheme Hook:** `/src/lib/hooks/useTheme.ts`

---

**Última Atualização:** 7 de Outubro, 2025  
**Versão:** 2.0  
**Status:** ✅ Produção Ready
