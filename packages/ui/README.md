# @ysh/ui

Reusable UI components and Yello Solar Hub brand utilities for the monorepo.

## Install (monorepo)

- Add dependency to your app package.json:
  - `"@ysh/ui": "file:../packages/ui"`
- Ensure Next transpiles the package:
  - `next.config.js` → `transpilePackages: ["@ysh/ui", "@medusajs/ui", "@medusajs/icons"]`

## Styles

Import brand tokens and gradient utilities once in your app entry (layout/_app):

```typescript
import "@ysh/ui/styles/theme.css"
import "@ysh/ui/styles/gradients.css"
```

## Components

### Yello Solar Branded Components

```typescript
import {
  YelloSolarButton,
  YelloSolarAlert,
  SuccessAlert,
  ErrorAlert,
  InfoAlert,
  WarningAlert,
  YshGradientIcon,
  YshLogoMark,
  DegradedBanner
} from "@ysh/ui"

export function Hero() {
  return (
    <div className="ysh-border-gradient p-6 rounded-xl">
      <h2 className="ysh-text-gradient text-2xl font-semibold">
        Energia inteligente para todos
      </h2>
      <YelloSolarButton className="mt-4" variant="stroke">
        Explorar produtos
      </YelloSolarButton>

      <YelloSolarAlert variant="info" className="mt-4">
        Sistema funcionando normalmente
      </YelloSolarAlert>

      <SuccessAlert className="mt-2">
        Dados atualizados com sucesso!
      </SuccessAlert>
    </div>
  )
}
```

### Basic Components

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@ysh/ui"

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{product.description}</p>
      </CardContent>
    </Card>
  )
}
```

### Data Table

```typescript
import { DataTable } from "@ysh/ui"

export function ProductsTable({ products, columns }) {
  return (
    <DataTable
      instance={tableInstance}
      columns={columns}
      data={products}
    />
  )
}
```

## Component API

### YelloSolarButton

```typescript
interface YelloSolarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "stroke" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}
```

### YelloSolarAlert

```typescript
interface YelloSolarAlertProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "error" | "success" | "warning" | "info"
  dismissible?: boolean
  showIcon?: boolean
}
```

Pre-configured variants: `SuccessAlert`, `ErrorAlert`, `InfoAlert`, `WarningAlert`

### Card Components

- `Card` - Container with shadow and border
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

## Theming

Customize brand colors and angle by overriding CSS variables (e.g., in your app globals):

```css
:root {
  --ysh-start: #00E0FF;
  --ysh-end:   #21FF7E;
  --ysh-angle: 90deg;
}
```

## Utility Classes

- `.ysh-border-gradient` - Gradient border effect
- `.ysh-text-gradient` - Gradient text effect

## Development

```bash
# Build the package
npm run build

# Development watch mode
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
```
