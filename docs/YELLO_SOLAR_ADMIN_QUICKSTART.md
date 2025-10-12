# ☀️ Quick Start: Testing Yellow Solar Hub Admin Widgets

## Prerequisites

- Backend server running on `http://localhost:9000`
- Admin user account created
- Solar products imported into the database

## Step 1: Build Admin with New Widgets

```powershell
cd backend
yarn build
```

**Expected output**:

```tsx
✔ Building admin...
✔ Admin built successfully in /backend/.medusa/admin
```

## Step 2: Start Development Server

```powershell
yarn dev
```

**Wait for**:

```tsx
[medusa] Server is ready on http://localhost:9000
```

## Step 3: Access Admin Dashboard

1. Open browser: `http://localhost:9000/app`
2. Login with your admin credentials
3. Navigate to **Products** in the sidebar

## Step 4: Test Solar Inventory Dashboard

**Location**: Top of Products page (before product list)

**What to Check**:

- [ ] Widget loads without errors
- [ ] Shows total product count (1,123 expected)
- [ ] Displays 9 category cards with icons
- [ ] Shows power capacity in MW
- [ ] Shows inventory value in R$
- [ ] Shows products without price (66 expected)
- [ ] Click **🔄 Atualizar** button - metrics refresh

**Troubleshooting**:

- If widget doesn't appear: Clear browser cache (Ctrl+Shift+R)
- If shows 0 products: Check that products are imported to database

## Step 5: Test Solar Product Details

**Location**: Bottom of any product detail page

**How to Test**:

1. Click any product in the list
2. Scroll to bottom of page
3. Look for "Especificações Técnicas Solares" widget

**What to Check**:

- [ ] Widget appears only for solar products (panels, inverters, kits)
- [ ] Shows technical specs relevant to product category
- [ ] Panels show: power_w, technology, efficiency
- [ ] Inverters show: power_kw, type, voltage_v, phases
- [ ] Kits show: potencia_kwp, total_panels, total_inverters
- [ ] Manufacturer and distributor info displayed
- [ ] Category badge shows correct type

**Test Products**:

- Panel: Look for "Painel Solar Odex 600W"
- Inverter: Look for "Microinversor Deye SUN2250"
- Kit: Look for "Kit 1.2 kWp - ASTRONERGY"

## Step 6: Test Solar Kit Composition

**Location**: Bottom of kit product detail pages (only for kits)

**How to Test**:

1. Search for "kit" in product list
2. Click any kit product
3. Scroll to "Composição do Kit Solar" widget

**What to Check**:

- [ ] Widget appears only for kit products
- [ ] Shows panel list with quantities and specs
- [ ] Shows inverter list with capacities
- [ ] Shows system overview metrics (4 cards)
- [ ] Click **🔧 Calculadora** button
- [ ] Calculator section expands
- [ ] Shows panel-to-inverter ratio analysis
- [ ] Shows energy generation estimates (daily/monthly/yearly)
- [ ] Ratio status displays correct color:
  - Green (✅) for 1.1x-1.3x
  - Yellow (⚠️) for 0.8x-1.5x
  - Red (❌) for outside range

**Test Kit**: `FOTUS-KP04-kits-hibridos`

- Expected ratio: ~0.53x (Warning)
- Expected generation: ~4.8 kWh/day

## Step 7: Check Browser Console

**Open Developer Tools**: F12 → Console tab

**What to Look For**:

- [ ] No JavaScript errors
- [ ] No failed fetch requests
- [ ] No TypeScript compilation errors

**Common Errors**:

- `401 Unauthorized`: Not logged in to admin
- `404 Not Found`: Product metadata missing
- `TypeError`: Incorrect data types in metadata

## Step 8: Verify Data Accuracy

**Sample Product to Test**: Inverter `neosolar_inverters_21632`

Expected technical specs:

```json
{
  "power_kw": 2,
  "type": "OFF-GRID",
  "voltage_v": 127,
  "efficiency": 2000,
  "power_w": 2000
}
```

**Widget Should Display**:

- Potência Nominal: 2.00 kW (highlighted)
- Tipo de Inversor: OFF-GRID
- Tensão de Saída: 127 V
- Fabricante: EPEVER
- Preço: R$ 1.719,00

## Step 9: Test Responsiveness

**Desktop** (1920x1080):

- [ ] Dashboard shows 4 columns of metrics
- [ ] Category cards in 5 columns
- [ ] Spec cards in 3 columns

**Tablet** (768x1024):

- [ ] Dashboard shows 2 columns
- [ ] Category cards in 3 columns
- [ ] Spec cards in 2 columns

**Mobile** (375x667):

- [ ] Dashboard shows 1 column
- [ ] Category cards in 2 columns
- [ ] Spec cards in 1 column

## Step 10: Performance Testing

**Test Large Product List**:

1. Navigate to Products page
2. Observe initial load time
3. Check browser Network tab (F12 → Network)

**Expected**:

- Dashboard loads in < 2 seconds
- API call to `/admin/products?limit=1000`
- No unnecessary re-renders
- Smooth scrolling with no lag

**If Slow**:

- Check if fetching >1000 products (add pagination)
- Check if images are loading (lazy load off-screen)
- Check if expensive calculations on every render (memoize)

## Common Issues & Solutions

### Issue: Widgets Not Appearing

**Solution 1**: Rebuild admin

```powershell
cd backend
rm -rf .medusa/admin
yarn build
```

**Solution 2**: Clear all caches

- Browser cache: Ctrl+Shift+Delete
- Node modules: `rm -rf node_modules; yarn install`
- TypeScript: `rm -rf dist; yarn build`

### Issue: Wrong Data Displayed

**Check 1**: Product metadata structure

```sql
-- In PostgreSQL
SELECT metadata FROM product WHERE id = 'your_product_id';
```

**Expected structure**:

```json
{
  "category": "inverters",
  "technical_specs": {
    "power_kw": 2.25,
    "type": "MICROINVERSOR"
  }
}
```

**Check 2**: Data types

- All power values should be numbers, not strings
- Quantities should be integers
- Prices should be in cents (multiply by 100)

### Issue: Calculator Shows Wrong Results

**Check 1**: Kit metadata

```javascript
// Console
fetch('/admin/products/FOTUS-KP04-kits-hibridos')
  .then(r => r.json())
  .then(d => console.log(d.product.metadata))
```

**Expected**:

```json
{
  "panels": [
    { "brand": "ASTRONERGY", "power_w": 600, "quantity": 2 }
  ],
  "inverters": [
    { "brand": "TSUNESS", "power_kw": 2.25, "quantity": 1 }
  ]
}
```

**Check 2**: Calculation formulas

- Ratio: `(panels_total_kw) / (inverters_total_kw)`
- Daily energy: `kWp × 5 hours × 0.8 efficiency`

## Success Checklist

- [x] **3 widgets created** (1,340 lines)
- [ ] All widgets load without errors
- [ ] Dashboard shows correct product counts
- [ ] Product details show category-specific specs
- [ ] Kit composition displays components correctly
- [ ] Calculator shows ratio analysis
- [ ] Energy generation estimates are reasonable
- [ ] No console errors
- [ ] Responsive design works on mobile
- [ ] Performance is acceptable (<2s load)

## Next Steps After Testing

1. **If tests pass**:
   - Deploy to production
   - Train merchants on widget usage
   - Monitor analytics for widget engagement

2. **If tests fail**:
   - Check browser console for errors
   - Verify product metadata structure
   - Review this troubleshooting guide
   - Check GitHub Issues for similar problems

3. **Enhancements**:
   - Add unit tests for calculation functions
   - Implement widget preferences/settings
   - Add export to PDF/Excel features
   - Create video tutorial for merchants

## Support

For issues or questions:

- Check `backend/src/admin/YELLOW_SOLAR_HUB_ADMIN_GUIDE.md`
- Review `docs/YELLOW_SOLAR_ADMIN_IMPLEMENTATION.md`
- Search Medusa Admin SDK docs
- Open GitHub issue with error details

---

**Testing Completed**: _**/**_/_____  
**Tested By**: _________________  
**Environment**: [ ] Local [ ] Docker [ ] Production  
**Status**: [ ] Pass [ ] Fail [ ] Partial

---

**Built for Yellow Solar Hub** ☀️⚡
