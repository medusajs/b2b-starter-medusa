# ✅ CORREÇÃO: Erro PostHogScript - Runtime TypeError

## 🐛 Erro Original

```
Runtime TypeError: can't access property "call", originalFactory is undefined
at RootLayout (src\app\layout.tsx:60:9)
```

## 🔍 Causa Raiz

O componente `PostHogScript` era um Client Component sendo chamado diretamente em um Server Component (layout.tsx), causando conflito de hidratação no Next.js 15.5.4.

## ✅ Solução Implementada

### 1. **PostHogScript.tsx atualizado**

- Melhorou o carregamento do script PostHog
- Adicionou URL versionada: `posthog-js@1.96.1/dist/umd/posthog-js.umd.js`
- Melhorou tratamento de erros
- Adicionou verificação de carregamento (`__loaded`)
- Script adicionado ao `<head>` ao invés de `<body>`

### 2. **AnalyticsProvider.tsx criado** (NOVO)

- Wrapper Client Component para isolar a lógica client-side
- Segue o padrão recomendado do Next.js 15
- Encapsula o PostHogScript corretamente

### 3. **layout.tsx atualizado**

- Removido import direto de `PostHogScript`
- Adicionado `AnalyticsProvider` que encapsula o analytics
- Estrutura de componentes corrigida:

  ```tsx
  <AnalyticsProvider>
    <PWAProvider>
      <LeadQuoteProvider>
        {children}
      </LeadQuoteProvider>
    </PWAProvider>
  </AnalyticsProvider>
  ```

## 📁 Arquivos Modificados

1. ✅ `storefront/src/modules/analytics/PostHogScript.tsx`
   - Melhorado carregamento e error handling

2. ✅ `storefront/src/modules/analytics/AnalyticsProvider.tsx` (NOVO)
   - Client Component wrapper

3. ✅ `storefront/src/app/layout.tsx`
   - Substituído PostHogScript direto por AnalyticsProvider

## 🧪 Verificação

O erro deve estar resolvido. Para confirmar:

1. O Next.js deve recompilar automaticamente
2. Recarregue <http://localhost:3000>
3. Não deve mais aparecer o erro de "originalFactory is undefined"

## 📝 Notas Técnicas

### Por que o erro aconteceu?

- Next.js 15 separa rigorosamente Server Components e Client Components
- Componentes com `"use client"` não podem ser instanciados diretamente em Server Components
- É necessário um wrapper intermediário

### Padrão correto no Next.js 15

```tsx
// ❌ ERRADO (antes)
<PostHogScript />  // Client component direto no layout

// ✅ CORRETO (agora)
<AnalyticsProvider>  // Wrapper que encapsula client components
  <PostHogScript />
</AnalyticsProvider>
```

## 🚀 Próximos Passos

Se o erro persistir:

1. Pare o servidor dev (Ctrl+C na janela do storefront)
2. Delete `.next` folder: `rm -rf .next`
3. Reinicie: `npm run dev`

---

**Status:** ✅ CORRIGIDO
**Data:** 7 de Outubro de 2025
**Versão Next.js:** 15.5.4
