# 🎨 Usando Degradê como Stroke

O pacote `@ysh/ui` agora oferece suporte a gradientes como stroke em elementos SVG, usando as cores da marca YSH.

## Quick Start

```tsx
import { GradientDefs } from '@ysh/ui';

// 1. Adicione GradientDefs no root do app (apenas uma vez)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GradientDefs />
        {children}
      </body>
    </html>
  );
}

// 2. Use as classes utilitárias em elementos SVG
<svg className="stroke-gradient-ysh">
  <circle cx="50" cy="50" r="40" strokeWidth="4" fill="none" />
</svg>
```

## Classes Disponíveis

### `.stroke-gradient-ysh`

Gradiente linear diagonal (canto superior esquerdo → inferior direito)

### `.stroke-gradient-ysh-radial`

Gradiente radial (centro → borda)

### `.stroke-gradient-css`

Gradiente CSS (para textos com stroke, experimentação)

## Gradientes SVG Disponíveis

### `#ysh-gradient`

Gradiente linear padrão usando `--ysh-start` e `--ysh-end`

### `#ysh-gradient-radial`

Gradiente radial usando `--ysh-start` e `--ysh-end`

### `#ysh-gradient-sunburst`

Gradiente estilo "raios de sol" (amarelo → laranja → vermelho) — ideal para logo

## Exemplos

### Círculo com Stroke Gradiente

```tsx
<GradientDefs />
<svg width="200" height="200" className="stroke-gradient-ysh">
  <circle cx="100" cy="100" r="80" strokeWidth="8" fill="none" />
</svg>
```

### Ícone com Gradiente

```tsx
<svg className="stroke-gradient-ysh" viewBox="0 0 24 24">
  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" 
        strokeWidth="2" 
        fill="none" />
</svg>
```

### Padrão Sunburst (Logo)

```tsx
<svg width="200" height="200">
  {Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    return (
      <line
        key={i}
        x1="100" y1="100"
        x2={100 + Math.cos((angle * Math.PI) / 180) * 90}
        y2={100 + Math.sin((angle * Math.PI) / 180) * 90}
        stroke="url(#ysh-gradient-sunburst)"
        strokeWidth="12"
        strokeLinecap="round"
      />
    );
  })}
</svg>
```

## Customização

Para criar novos gradientes, edite `src/components/GradientDefs.tsx` e adicione novas definições `<linearGradient>` ou `<radialGradient>`.

## Ver Exemplos

Execute o Storybook para ver todos os exemplos interativos:

```bash
cd packages/ui
pnpm storybook
```

Navegue para **Design System → GradientDefs**.
