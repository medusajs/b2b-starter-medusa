# 🔥 Phase 1.2: Toast System Implementation Plan

> **Date**: October 8, 2025  
> **Status**: 🟡 IN PROGRESS  
> **Estimated**: 3-5 days

---

## 🎯 Objective

Implement comprehensive toast feedback system across 28 key user interaction points to improve UX and provide clear feedback for all critical actions.

---

## 📊 Toast Locations Identified

### Category 1: Add to Cart (12 locations) 🛒

| # | File | Action | Priority |
|---|------|--------|----------|
| 1 | `product-actions/index.tsx` | Add product to cart | 🔥 HIGH |
| 2 | `product-actions/mobile-actions.tsx` | Add product to cart (mobile) | 🔥 HIGH |
| 3 | `product-variants-table/index.tsx` | Add bulk variants to cart | 🔥 HIGH |
| 4 | `product-preview/preview-add-to-cart.tsx` | Quick add from preview | 🔥 HIGH |
| 5 | `catalogo/client-page.tsx` | Add kit to cart | 🔥 HIGH |
| 6 | `viability/integrations.tsx` | Add viability result to cart | HIGH |
| 7 | `cart-context.tsx` | Optimistic add to cart (already has error toast) | ✅ PARTIAL |

### Category 2: Cart Management (5 locations) 🛒

| # | File | Action | Priority |
|---|------|--------|----------|
| 8 | `delete-button/index.tsx` | Remove item from cart | HIGH |
| 9 | `cart-context.tsx` - handleUpdateCartQuantity | Update item quantity | HIGH |
| 10 | `cart-context.tsx` - handleEmptyCart | Empty entire cart | MEDIUM |
| 11 | `item-full/index.tsx` | Add item to quote from cart | MEDIUM |

### Category 3: Favorites/Wishlist (8 locations) ❤️

| # | File | Action | Priority |
|---|------|--------|----------|
| 12 | `ProductCard.tsx` (catalog) | Add/remove favorite | MEDIUM |
| 13 | `EnrichedProductCard.tsx` | Add/remove favorite | MEDIUM |
| 14 | `KitCard.tsx` | Add/remove favorite kit | MEDIUM |
| 15-19 | Product detail pages | Add/remove favorite | LOW |

### Category 4: Quote Management (3 locations) 📋

| # | File | Action | Priority |
|---|------|--------|----------|
| 20 | `lead-quote/context.tsx` | Add to quote (already has toast) | ✅ DONE |
| 21 | `ProductCard.tsx` | Add to quote | MEDIUM |
| 22 | `KitCard.tsx` | Add to quote | MEDIUM |

### Category 5: Forms & Calculations (5 locations) 📝

| # | File | Action | Priority |
|---|------|--------|----------|
| 23 | `cotacao/page.tsx` | Save calculation (already has toast) | ✅ DONE |
| 24 | `solar-results.tsx` | Download PDF | MEDIUM |
| 25 | `cart-to-csv-button/index.tsx` | Export cart CSV | LOW |
| 26 | Onboarding forms | Save step data | LOW |
| 27 | Compliance forms | Submit validation | LOW |
| 28 | Finance simulator | Save simulation | LOW |

---

## 🎨 Toast Types & Messages

### Success Toasts ✅

```tsx
// Add to cart
toast.success("Produto adicionado ao carrinho", {
  duration: 3000,
  action: {
    label: "Ver carrinho",
    onClick: () => router.push('/cart')
  }
})

// Bulk add
toast.success("3 produtos adicionados ao carrinho", {
  duration: 3000,
  action: {
    label: "Ver carrinho",
    onClick: () => router.push('/cart')
  }
})

// Favorite added
toast.success("Produto favoritado")

// Quote added
toast.success("Item adicionado à cotação", {
  action: {
    label: "Ver cotação",
    onClick: () => router.push('/cotacao')
  }
})

// Item removed
toast.success("Item removido do carrinho")

// Cart emptied
toast.success("Carrinho esvaziado")

// Quantity updated
toast.success("Quantidade atualizada")
```

### Error Toasts ❌

```tsx
// Add to cart failed
toast.error("Erro ao adicionar ao carrinho. Tente novamente.")

// Cart blocked
toast.error("Carrinho bloqueado para aprovação")

// Out of stock
toast.error("Produto fora de estoque")

// Invalid quantity
toast.error("Quantidade inválida")

// Network error
toast.error("Erro de conexão. Verifique sua internet.")
```

### Info Toasts ℹ️

```tsx
// Approval required
toast.info("Este pedido requer aprovação", {
  duration: 5000
})

// Minimum quantity
toast.info("Quantidade mínima: 10 unidades")

// Price quote only
toast.info("Produto disponível apenas sob cotação")
```

### Warning Toasts ⚠️

```tsx
// Low stock
toast.warning("Apenas 5 unidades em estoque")

// Price changed
toast.warning("O preço deste produto foi atualizado")
```

---

## 🛠️ Implementation Strategy

### Phase 1: High Priority (Day 1-2) 🔥

1. ✅ Add to cart actions (7 locations)
2. ✅ Cart management (delete, update quantity)

### Phase 2: Medium Priority (Day 3)

3. Add to quote actions (already mostly done)
4. Favorites/wishlist

### Phase 3: Low Priority (Day 4-5)

5. Forms & calculations
6. Edge cases & polish
7. Testing & validation

---

## 📝 Code Pattern

### Standard Add to Cart with Toast

```tsx
const handleAddToCart = async () => {
  setIsAdding(true)
  
  try {
    // Emit event (optimistic update in cart-context)
    addToCartEventBus.emitCartAdd({
      lineItems: [{ productVariant, quantity }],
      regionId: region.id
    })
    
    // Success toast
    toast.success("Produto adicionado ao carrinho", {
      duration: 3000,
      action: {
        label: "Ver carrinho",
        onClick: () => router.push('/cart')
      }
    })
  } catch (error) {
    toast.error("Erro ao adicionar ao carrinho")
  } finally {
    setIsAdding(false)
  }
}
```

### Bulk Add with Count

```tsx
const handleBulkAdd = async () => {
  const count = lineItems.length
  
  try {
    addToCartEventBus.emitCartAdd({ lineItems, regionId })
    
    toast.success(`${count} ${count === 1 ? 'produto adicionado' : 'produtos adicionados'} ao carrinho`, {
      action: {
        label: "Ver carrinho",
        onClick: () => router.push('/cart')
      }
    })
  } catch (error) {
    toast.error("Erro ao adicionar produtos")
  }
}
```

### Delete with Undo (Optional)

```tsx
const handleDelete = async (id: string) => {
  try {
    await handleDeleteItem(id)
    
    toast.success("Item removido", {
      action: {
        label: "Desfazer",
        onClick: () => handleUndo(id)
      }
    })
  } catch (error) {
    toast.error("Erro ao remover item")
  }
}
```

---

## 🎯 Success Criteria

- [x] Toast system using Medusa UI toast
- [ ] 12+ add to cart locations with success feedback
- [ ] 5+ cart management actions with feedback
- [ ] Error handling with clear messages
- [ ] Action buttons in toasts (Ver carrinho, Desfazer)
- [ ] Proper duration (3s for success, 5s for info)
- [ ] Portuguese messages (pt-BR)
- [ ] Consistent styling
- [ ] No duplicate toasts
- [ ] Accessibility (screen reader friendly)

---

## 🚀 Files to Modify

### High Priority (Day 1-2)

1. ✅ `src/lib/context/cart-context.tsx` - Add success toasts
2. `src/modules/products/components/product-actions/index.tsx`
3. `src/modules/products/components/product-actions/mobile-actions.tsx`
4. `src/modules/products/components/product-variants-table/index.tsx`
5. `src/modules/products/components/product-preview/preview-add-to-cart.tsx`
6. `src/app/[countryCode]/(main)/catalogo/client-page.tsx`
7. `src/modules/common/components/delete-button/index.tsx`

### Medium Priority (Day 3)

8. `src/modules/catalog/components/ProductCard.tsx`
9. `src/modules/catalog/components/EnrichedProductCard.tsx`
10. `src/modules/catalog/components/KitCard.tsx`
11. `src/modules/cart/components/item-full/index.tsx`

### Low Priority (Day 4-5)

12. `src/components/solar/solar-results.tsx`
13. `src/modules/cart/components/cart-to-csv-button/index.tsx`
14. Various form components

---

## 🧪 Testing Checklist

- [ ] Add to cart shows success toast
- [ ] Bulk add shows count
- [ ] Error scenarios show error toast
- [ ] Action buttons navigate correctly
- [ ] No duplicate toasts
- [ ] Mobile responsive
- [ ] Dark mode compatible
- [ ] Screen reader announces toasts
- [ ] Toast dismissible
- [ ] Multiple toasts stack properly

---

**Next Action**: Start implementing high priority toasts (cart actions)
