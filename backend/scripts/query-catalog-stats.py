#!/usr/bin/env python3
import sys
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "psycopg2-binary"])
    import psycopg2
    from psycopg2 import sql

# RDS connection
conn = psycopg2.connect(
    host="ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com",
    port=5432,
    dbname="postgres",
    user="supabase_admin",
    password="po5lwIAe_kKb5Ham0nPr2qeah2CGDNys",
    sslmode="require"
)

cur = conn.cursor()

# Total produtos
cur.execute("SELECT COUNT(*) FROM catalog")
total = cur.fetchone()[0]
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
print(f"TOTAL DE PRODUTOS NO CATÁLOGO: {total}")
print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

# Por status
cur.execute("SELECT is_active, COUNT(*) FROM catalog GROUP BY is_active ORDER BY is_active DESC")
print("\nDistribuição por Status:")
for row in cur.fetchall():
    status = "✅ Ativos" if row[0] else "❌ Inativos"
    print(f"  {status}: {row[1]} produtos")

# Por categoria
cur.execute("SELECT category, COUNT(*) FROM catalog GROUP BY category ORDER BY COUNT(*) DESC")
categories = cur.fetchall()
print(f"\nDistribuição por Categoria ({len(categories)} categorias):")
for row in categories:
    print(f"  - {row[0]}: {row[1]} produtos")

# Por fabricante  
cur.execute("SELECT manufacturer, COUNT(*) FROM catalog GROUP BY manufacturer ORDER BY COUNT(*) DESC")
manufacturers = cur.fetchall()
print(f"\nDistribuição por Fabricante ({len(manufacturers)} fabricantes):")
for row in manufacturers:
    print(f"  - {row[0]}: {row[1]} produtos")

# Valor total
cur.execute("SELECT SUM(price) FROM catalog WHERE is_active = true")
total_value = cur.fetchone()[0]
print(f"\n💰 Valor Total em Estoque (ativos): R$ {total_value:,.2f}".replace(',', '_').replace('.', ',').replace('_', '.'))

cur.close()
conn.close()
