# @ysh/ui

Reusable UI components and Yello Solar Hub brand utilities for the monorepo.

## Install (monorepo)

- Add dependency to your app package.json:
  - "@ysh/ui": "file:../packages/ui"
- Ensure Next transpiles the package:
  - next.config.js → `transpilePackages: ["@ysh/ui", "@medusajs/ui", "@medusajs/icons"]`

## Styles

Import brand tokens and gradient utilities once in your app entry (layout/_app):

```
import "@ysh/ui/styles/theme.css"
import "@ysh/ui/styles/gradients.css"
```

## Components

```
import { YshButton, YshAlert, YshGradientIcon, YshLogoMark } from "@ysh/ui"

export function Hero() {
  return (
    <div className="ysh-border-gradient p-6 rounded-xl">
      <h2 className="ysh-text-gradient text-2xl font-semibold">Energia inteligente para todos</h2>
      <YshButton className="mt-4" variant="stroke">Explorar produtos</YshButton>
    </div>
  )
}
```

## Theming

Customize brand colors and angle by overriding CSS variables (e.g., in your app globals):

```
:root {
  --ysh-start: #00E0FF;
  --ysh-end:   #21FF7E;
  --ysh-angle: 90deg;
}
```

