"""Quick validation of NeoSolar normalized kits"""
import json

# Load data
with open('neosolar-kits-normalized.json', 'r', encoding='utf-8') as f:
    kits = json.load(f)

print("\n" + "="*80)
print("🔍 NEOSOLAR KITS VALIDATION")
print("="*80)

# Get samples with components
samples = [k for k in kits[:20] if k.get('panels')]

print(f"\n📊 Total kits: {len(kits)}")
print(f"📦 Samples with panels: {len(samples)}")

print("\n" + "="*80)
print("📝 SAMPLE KITS:")
print("="*80)

for i, kit in enumerate(samples[:5], 1):
    print(f"\n🔹 Kit {i}: {kit['name'][:70]}...")
    print(f"   Type: {kit['type']}")
    print(f"   Power: {kit['potencia_kwp']}kWp")
    print(f"   Price: R$ {kit['price_brl']:,.2f}")
    print(f"\n   📌 Normalized:")
    print(f"   • Title: {kit['title']}")
    print(f"   • SKU: {kit['variant_sku']}")
    print(f"   • Handle: {kit['handle']}")
    print(f"   • Status: {kit['status']}")
    
    # Components
    print(f"\n   📦 Components:")
    
    if kit.get('panels'):
        for p in kit['panels']:
            print(f"   • Panel: {p['brand']} {p['power_w']}W x{p['quantity']}")
    
    if kit.get('batteries'):
        for b in kit['batteries']:
            print(f"   • Battery: {b['brand']} {b['capacity_ah']}Ah/{b['voltage_v']}V x{b['quantity']} ({b['technology']})")
    
    if kit.get('inverters') and kit['inverters'][0]['brand'] != 'None':
        for inv in kit['inverters']:
            print(f"   • {inv['type']}: {inv['brand']} {inv['rating']} x{inv['quantity']}")
    
    print(f"\n   🏷️  Tags ({len(kit['tags'])}): {', '.join(kit['tags'][:6])}...")

# Statistics
print("\n" + "="*80)
print("📊 STATISTICS:")
print("="*80)

off_grid = len([k for k in kits if k['type'] == 'off-grid'])
hybrid = len([k for k in kits if k['type'] == 'hybrid'])
grid_tie = len([k for k in kits if k['type'] == 'grid-tie'])

print(f"\n🔋 Kit Types:")
print(f"   • Off-Grid: {off_grid} ({off_grid/len(kits)*100:.1f}%)")
print(f"   • Hybrid: {hybrid} ({hybrid/len(kits)*100:.1f}%)")
print(f"   • Grid-Tie: {grid_tie} ({grid_tie/len(kits)*100:.1f}%)")

# Power distribution
powers = [k['potencia_kwp'] for k in kits if k['potencia_kwp'] > 0]
if powers:
    print(f"\n⚡ Power Range:")
    print(f"   • Min: {min(powers):.2f}kWp")
    print(f"   • Max: {max(powers):.2f}kWp")
    print(f"   • Average: {sum(powers)/len(powers):.2f}kWp")

# Price distribution
prices = [k['price_brl'] for k in kits if k['price_brl'] > 0]
if prices:
    print(f"\n💰 Price Range:")
    print(f"   • Min: R$ {min(prices):,.2f}")
    print(f"   • Max: R$ {max(prices):,.2f}")
    print(f"   • Average: R$ {sum(prices)/len(prices):,.2f}")

# Availability
available = len([k for k in kits if k['status'] == 'published'])
print(f"\n📦 Availability:")
print(f"   • Published: {available} ({available/len(kits)*100:.1f}%)")
print(f"   • Draft: {len(kits) - available} ({(len(kits) - available)/len(kits)*100:.1f}%)")

print("\n" + "="*80)
print("✅ VALIDATION COMPLETE!")
print("="*80)
