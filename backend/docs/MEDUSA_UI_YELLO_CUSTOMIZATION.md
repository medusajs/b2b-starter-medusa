# 🎨 Medusa UI + Yello Brand Customization Guide

## 📋 Visão Geral

Este guia documenta a personalização do Medusa UI com o stroke degradê da marca Yello Solar Hub.

**Gradiente da Marca:**

```css
linear-gradient(135deg, #FFCE00 0%, #FF6600 50%, #FF0066 100%)
```

**Cores:**

- 🟡 Yellow: `#FFCE00`
- 🟠 Orange: `#FF6600`
- 🔴 Magenta: `#FF0066`

---

## 🚀 Instalação e Configuração

### 1. Pacotes Instalados

```json
{
  "@medusajs/ui": "4.0.14",
  "@medusajs/ui-preset": "2.8.4",
  "@medusajs/icons": "2.8.4"
}
```

### 2. Importar Estilos Personalizados

No seu arquivo principal de estilos (`app/layout.tsx` ou `_app.tsx`):

```tsx
import '@/styles/medusa-ui-yello.css'
```

### 3. Configuração do Tailwind (opcional)

Se ainda não configurado, adicione no `tailwind.config.js`:

```js
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'yello-yellow': '#FFCE00',
        'yello-orange': '#FF6600',
        'yello-magenta': '#FF0066',
      }
    }
  }
}
```

---

## 🎯 Componentes Personalizados

### 1. Buttons (Botões)

#### Button Primary - Gradient Fill

```tsx
import { Button } from "@medusajs/ui"

// Botão com preenchimento gradiente
<Button variant="primary" className="medusa-button-primary">
  Solicitar Orçamento
</Button>

// Com ícone
<Button variant="primary" className="medusa-button-primary">
  <PlusIcon />
  Adicionar Produto
</Button>
```

**Resultado:** Botão com fundo degradê amarelo → laranja → magenta, hover escurecido

#### Button Secondary - Gradient Stroke

```tsx
import { Button } from "@medusajs/ui"

// Botão com borda gradiente
<Button variant="secondary" className="medusa-button-secondary">
  Ver Detalhes
</Button>

// Estado disabled
<Button 
  variant="secondary" 
  className="medusa-button-secondary"
  disabled
>
  Indisponível
</Button>
```

**Resultado:** Botão transparente com borda gradiente, hover com preenchimento

---

### 2. Inputs (Campos de Entrada)

#### Input com Focus Gradient

```tsx
import { Input } from "@medusajs/ui"

// Input padrão com focus gradiente
<Input
  type="text"
  placeholder="Digite seu email"
  className="medusa-input"
/>

// Input com label
<div className="space-y-2">
  <label htmlFor="email" className="text-sm font-medium">
    Email
  </label>
  <Input
    id="email"
    type="email"
    placeholder="seu@email.com"
    className="medusa-input"
  />
</div>
```

**Resultado:** Input com borda gradiente no estado `:focus`

---

### 3. Badges (Distintivos)

#### Badge com Gradient Background

```tsx
import { Badge } from "@medusajs/ui"

// Badge com fundo gradiente
<Badge className="medusa-badge-gradient">
  Novo
</Badge>

<Badge className="medusa-badge-gradient">
  Premium ⚡
</Badge>
```

#### Badge com Gradient Stroke

```tsx
// Badge com borda gradiente
<Badge className="medusa-badge-outline">
  Em estoque
</Badge>

<Badge className="medusa-badge-outline">
  Promoção 🔥
</Badge>
```

**Resultado:** Badges com estilo Yello

---

### 4. Cards (Cartões)

#### Card com Gradient Border

```tsx
import { Card } from "@medusajs/ui"

// Card com borda gradiente
<Card className="card-gradient-border">
  <h3 className="font-semibold text-lg mb-2">
    Painel Fotovoltaico 550W
  </h3>
  <p className="text-gray-600">
    Alta eficiência, garantia de 25 anos
  </p>
  <div className="mt-4">
    <span className="text-2xl font-bold text-gradient-yello">
      R$ 850,00
    </span>
  </div>
</Card>
```

#### Card com Header Gradient

```tsx
// Card com cabeçalho gradiente
<Card>
  <div className="card-header-gradient">
    Resumo do Pedido
  </div>
  <div className="p-6">
    <p>Total: R$ 12.500,00</p>
    <Button className="medusa-button-primary mt-4 w-full">
      Finalizar Compra
    </Button>
  </div>
</Card>
```

**Resultado:** Cards com visual Yello destacado

---

### 5. Tabs (Abas)

#### Tabs com Active Gradient Underline

```tsx
import { Tabs } from "@medusajs/ui"

<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview" className="medusa-tab-active">
      Visão Geral
    </Tabs.Trigger>
    <Tabs.Trigger value="products">
      Produtos
    </Tabs.Trigger>
    <Tabs.Trigger value="quotes">
      Orçamentos
    </Tabs.Trigger>
  </Tabs.List>
  
  <Tabs.Content value="overview">
    {/* Conteúdo */}
  </Tabs.Content>
</Tabs>
```

**Resultado:** Aba ativa com underline gradiente

---

### 6. Progress (Progresso)

#### Progress Bar com Gradient

```tsx
import { Progress } from "@medusajs/ui"

// Barra de progresso gradiente
<div>
  <div className="flex justify-between mb-2">
    <span className="text-sm font-medium">
      Processamento do pedido
    </span>
    <span className="text-sm text-gray-600">75%</span>
  </div>
  <Progress value={75} className="medusa-progress-bar" />
</div>
```

**Resultado:** Barra de progresso com preenchimento gradiente

---

### 7. Switch/Toggle

#### Switch com Gradient quando Ativo

```tsx
import { Switch } from "@medusajs/ui"

// Toggle com gradiente
<Switch
  checked={isActive}
  onCheckedChange={setIsActive}
  className="medusa-switch"
/>

// Com label
<div className="flex items-center space-x-3">
  <Switch
    id="notifications"
    checked={notifications}
    onCheckedChange={setNotifications}
    className="medusa-switch"
  />
  <label htmlFor="notifications" className="text-sm">
    Receber notificações
  </label>
</div>
```

**Resultado:** Switch com fundo gradiente quando ativo

---

### 8. Alerts/Toasts

#### Alert com Gradient Accent

```tsx
import { Toast } from "@medusajs/ui"

// Toast informativo com acento gradiente
<Toast className="toast-info">
  <div className="flex items-start">
    <InfoCircleIcon className="w-5 h-5 mr-3" />
    <div>
      <h4 className="font-semibold">Pedido confirmado!</h4>
      <p className="text-sm mt-1">
        Seu pedido #12345 foi processado com sucesso.
      </p>
    </div>
  </div>
</Toast>
```

**Resultado:** Alert com borda esquerda gradiente

---

## 🎨 Utility Classes (Classes Utilitárias)

### Text Gradient

```tsx
// Texto com gradiente
<h1 className="text-gradient-yello text-4xl">
  Yello Solar Hub
</h1>

<p className="text-gradient-yello text-2xl font-bold">
  Energia limpa para todos
</p>
```

### Border Gradient

```tsx
// Elemento com borda gradiente
<div className="border-gradient-yello p-6 rounded-lg">
  <h3>Conteúdo destacado</h3>
  <p>Com borda gradiente personalizada</p>
</div>
```

### Background Gradient

```tsx
// Fundo gradiente
<div className="bg-gradient-yello p-8 rounded-xl">
  <h2 className="text-white text-3xl font-bold">
    Promoção Especial
  </h2>
  <p className="text-white/90 mt-2">
    Até 30% de desconto em kits solares
  </p>
</div>
```

### Hover Gradient

```tsx
// Hover com gradiente
<button className="hover-gradient-yello px-6 py-3 rounded-lg font-semibold">
  Ver Produtos
</button>
```

---

## ✨ Animações

### Gradient Shimmer

```tsx
// Animação de brilho gradiente
<div className="animate-gradient-shimmer p-4 rounded-lg">
  <p className="text-white font-semibold">
    🎉 Oferta especial por tempo limitado!
  </p>
</div>
```

### Gradient Pulse

```tsx
// Pulsação gradiente
<Badge className="animate-gradient-pulse bg-gradient-yello">
  Ao vivo
</Badge>
```

---

## 🌓 Dark Mode

Todos os componentes têm suporte automático ao dark mode:

```tsx
// Botão que funciona em light e dark mode
<Button variant="secondary" className="medusa-button-secondary">
  Funciona em ambos os temas
</Button>

// Card com borda gradiente adaptável
<Card className="card-gradient-border">
  Adapta automaticamente ao tema
</Card>
```

---

## 📦 Componentes Completos de Exemplo

### Product Card (Cartão de Produto)

```tsx
import { Card, Button, Badge } from "@medusajs/ui"
import { ShoppingCartIcon } from "@medusajs/icons"

export function ProductCard({ product }) {
  return (
    <Card className="card-gradient-border overflow-hidden">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <Badge className="medusa-badge-gradient absolute top-2 right-2">
          -{product.discount}%
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gradient-yello">
              R$ {product.price}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                R$ {product.oldPrice}
              </span>
            )}
          </div>
        </div>
        
        <Button 
          className="medusa-button-primary w-full mt-4"
          onClick={() => addToCart(product.id)}
        >
          <ShoppingCartIcon className="mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </Card>
  )
}
```

### Quote Request Form (Formulário de Orçamento)

```tsx
import { Input, Button, Card } from "@medusajs/ui"
import { useState } from "react"

export function QuoteRequestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  return (
    <Card className="card-gradient-border max-w-2xl mx-auto">
      <div className="card-header-gradient">
        Solicite seu Orçamento
      </div>
      
      <form className="p-6 space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium mb-2 block">
            Nome Completo
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Seu nome"
            className="medusa-input"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="text-sm font-medium mb-2 block">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            className="medusa-input"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="text-sm font-medium mb-2 block">
            Telefone
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="(00) 00000-0000"
            className="medusa-input"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        
        <div>
          <label htmlFor="message" className="text-sm font-medium mb-2 block">
            Mensagem
          </label>
          <textarea
            id="message"
            rows={4}
            placeholder="Descreva suas necessidades..."
            className="medusa-input w-full"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>
        
        <Button 
          type="submit"
          className="medusa-button-primary w-full"
        >
          Enviar Solicitação
        </Button>
      </form>
    </Card>
  )
}
```

### Dashboard Stats Card (Card de Estatísticas)

```tsx
import { Card, Badge } from "@medusajs/ui"
import { TrendingUpIcon } from "@medusajs/icons"

export function StatsCard({ title, value, change, trend }) {
  return (
    <Card className="card-gradient-border">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
          <Badge 
            className={trend === 'up' ? 'medusa-badge-gradient' : 'badge-outline'}
          >
            <TrendingUpIcon className="w-3 h-3 mr-1" />
            {change}%
          </Badge>
        </div>
        
        <p className="text-3xl font-bold text-gradient-yello">
          {value}
        </p>
        
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-yello h-2 rounded-full medusa-progress-bar"
              style={{ width: `${change}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
```

---

## ♿ Acessibilidade

Todos os componentes personalizados mantêm acessibilidade:

```tsx
// Focus visível com gradiente
<Button className="medusa-button-primary focus-visible:ring-gradient">
  Acessível
</Button>

// Labels apropriados
<div>
  <label htmlFor="search" className="sr-only">
    Buscar produtos
  </label>
  <Input 
    id="search"
    type="search"
    placeholder="Buscar..."
    className="medusa-input"
    aria-label="Buscar produtos"
  />
</div>
```

---

## 📱 Responsividade

Em dispositivos móveis, os gradientes são simplificados para melhor performance:

```css
/* Automático no CSS */
@media (max-width: 640px) {
  .medusa-button-primary {
    background: var(--yello-orange); /* Cor sólida em mobile */
  }
}
```

---

## 🎯 Tokens CSS Disponíveis

Use diretamente em seus estilos:

```css
/* Gradientes */
var(--gradient-yello-solar)
var(--gradient-yello-solar-vertical)
var(--gradient-yello-solar-radial)
var(--gradient-yello-stroke)

/* Cores principais */
var(--yello-yellow)    /* #FFCE00 */
var(--yello-orange)    /* #FF6600 */
var(--yello-magenta)   /* #FF0066 */

/* Variantes claras */
var(--yello-yellow-50)
var(--yello-yellow-100)
var(--yello-orange-50)
var(--yello-orange-100)
var(--yello-magenta-50)
var(--yello-magenta-100)
```

---

## 🔧 Troubleshooting

### Gradiente não aparece

1. Verifique se importou o CSS:

```tsx
import '@/styles/medusa-ui-yello.css'
```

2. Verifique se a classe está aplicada:

```tsx
<Button className="medusa-button-primary">Teste</Button>
```

### Conflito com Tailwind

Se houver conflito, use `!important` temporariamente:

```css
.medusa-button-primary {
  background: var(--gradient-yello-solar) !important;
}
```

### Performance em mobile

Os gradientes já são otimizados, mas se necessário:

```tsx
// Use cor sólida em mobile
<Button 
  className="medusa-button-primary sm:bg-yello-orange"
>
  Botão
</Button>
```

---

## 📚 Recursos Adicionais

- [Medusa UI Documentation](https://docs.medusajs.com/ui)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- Design System: `backend/docs/UX_UI_STRATEGIC_ANALYSIS_COMPLETE.md`

---

## ✅ Checklist de Implementação

- [x] Arquivo CSS criado (`medusa-ui-yello.css`)
- [x] Tokens de gradiente definidos
- [x] Componentes personalizados (Button, Input, Badge, Card, etc.)
- [x] Utility classes criadas
- [x] Animações implementadas
- [x] Dark mode suportado
- [x] Acessibilidade mantida
- [ ] CSS importado no layout principal
- [ ] Tailwind config atualizado (se necessário)
- [ ] Testes visuais realizados
- [ ] Documentação de uso criada ✅

---

**Última atualização:** $(Get-Date -Format "yyyy-MM-dd")  
**Versão:** 1.0.0  
**Autor:** GitHub Copilot + Yello Solar Hub Team
