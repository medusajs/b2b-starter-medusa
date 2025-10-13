#!/usr/bin/env python3
"""
Script para inserir dados do catálogo YSH no PostgreSQL do Medusa B2B
"""

import json
import os
import psycopg2
from psycopg2.extras import Json
import uuid
from datetime import datetime
import glob
import re

# Configurações do banco
DB_CONFIG = {
    'host': 'localhost',
    'port': 15432,
    'database': 'medusa_db',
    'user': 'medusa_user',
    'password': 'medusa_password'
}

# Diretórios dos dados
DATA_DIRS = [
    '/mnt/c/Users/fjuni/ysh_medusa/data/catalog/unified_schemas',
    '/mnt/c/Users/fjuni/ysh_medusa/data/catalog/extracted',
    '/mnt/c/Users/fjuni/ysh_medusa/data/catalog/schemas',
    '/mnt/c/Users/fjuni/ysh_medusa/data/catalog/schemas_enriched'
]

def connect_db():
    """Conecta ao banco PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Conectado ao PostgreSQL")
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")
        return None

def create_product_type(conn, type_name):
    """Cria ou obtém tipo de produto"""
    try:
        with conn.cursor() as cur:
            # Verifica se já existe
            cur.execute("SELECT id FROM product_type WHERE value = %s AND deleted_at IS NULL", (type_name,))
            result = cur.fetchone()

            if result:
                return result[0]

            # Cria novo tipo
            type_id = str(uuid.uuid4())
            cur.execute("""
                INSERT INTO product_type (id, value, created_at, updated_at)
                VALUES (%s, %s, NOW(), NOW())
            """, (type_id, type_name))

            conn.commit()
            print(f"✅ Tipo de produto criado: {type_name}")
            return type_id

    except Exception as e:
        print(f"❌ Erro ao criar tipo de produto {type_name}: {e}")
        return None

def create_product_category(conn, category_name):
    """Cria ou obtém categoria de produto"""
    try:
        with conn.cursor() as cur:
            # Verifica se já existe
            cur.execute("SELECT id FROM product_category WHERE name = %s AND deleted_at IS NULL", (category_name,))
            result = cur.fetchone()

            if result:
                return result[0]

            # Cria nova categoria
            category_id = str(uuid.uuid4())
            handle = category_name.lower().replace(' ', '-').replace('_', '-')

            cur.execute("""
                INSERT INTO product_category (id, name, description, handle, mpath, is_active, rank, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (category_id, category_name, f"Categoria {category_name}", handle, category_id, True, 0))

            conn.commit()
            print(f"✅ Categoria criada: {category_name}")
            return category_id

    except Exception as e:
        print(f"❌ Erro ao criar categoria {category_name}: {e}")
        return None

def create_price_set(conn, prices):
    """Cria conjunto de preços"""
    try:
        with conn.cursor() as cur:
            price_set_id = str(uuid.uuid4())

            # Insere price_set
            cur.execute("""
                INSERT INTO price_set (id, created_at, updated_at)
                VALUES (%s, NOW(), NOW())
            """, (price_set_id,))

            # Insere preços
            for price_data in prices:
                price_id = str(uuid.uuid4())
                amount = price_data.get('amount', 0)
                print(f"DEBUG: price_data = {price_data}")
                print(f"DEBUG: amount before conversion = {amount}, type = {type(amount)}")
                if amount is None or amount == 0:
                    continue  # Pula preços inválidos

                # Garante que amount seja um inteiro positivo
                if isinstance(amount, float):
                    amount = int(amount * 100)  # Converte para centavos se for decimal
                elif isinstance(amount, str):
                    # Remove caracteres não numéricos e converte
                    amount_str = re.sub(r'[^\d.]', '', amount)
                    try:
                        amount = int(float(amount_str) * 100)
                    except:
                        continue

                # Garante que amount seja um inteiro válido
                try:
                    if not isinstance(amount, int):
                        amount = int(amount)
                except (ValueError, TypeError):
                    continue  # Pula se não conseguir converter

                print(f"DEBUG: amount after conversion = {amount}, type = {type(amount)}")
                if amount is None or amount <= 0:
                    continue

                cur.execute("""
                    INSERT INTO price (id, raw_amount, amount, price_set_id, currency_code, min_quantity, max_quantity, created_at, updated_at, deleted_at, region_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s, %s)
                """, (price_id, amount, amount, price_set_id, price_data.get('currency', 'BRL'), 1, None, None, None))

            # Se não inseriu nenhum preço, remove o price_set vazio
            cur.execute("SELECT COUNT(*) FROM price WHERE price_set_id = %s", (price_set_id,))
            if cur.fetchone()[0] == 0:
                cur.execute("DELETE FROM price_set WHERE id = %s", (price_set_id,))
                return None

            conn.commit()
            return price_set_id

    except Exception as e:
        print(f"❌ Erro ao criar price_set: {e}")
        conn.rollback()
        return None

def insert_product(conn, product_data):
    """Insere um produto no banco"""
    try:
        with conn.cursor() as cur:
            # Gera IDs
            product_id = str(uuid.uuid4())
            variant_id = str(uuid.uuid4())

            # Dados do produto
            title = product_data.get('name', 'Produto sem nome')
            if not title or title == 'Produto sem nome':
                return None

            handle = product_data.get('id', f"product-{product_id}").lower().replace(' ', '-')
            description = product_data.get('description', '')
            thumbnail = product_data.get('processed_images', {}).get('medium', product_data.get('image', ''))

            # Tipo e categoria
            category_name = product_data.get('category', 'geral')
            type_name = product_data.get('category', 'produto')

            type_id = create_product_type(conn, type_name)
            category_id = create_product_category(conn, category_name)

            # Preços
            pricing = product_data.get('pricing', {})
            price_value = pricing.get('price', 0)
            
            # Se não tem pricing.price, tenta parsear o campo 'price' string
            if not price_value or price_value == 0:
                price_str = product_data.get('price', '')
                if price_str and isinstance(price_str, str):
                    # Remove "R$ " e converte vírgula para ponto
                    clean_price = price_str.replace('R$', '').replace(',', '.').strip()
                    try:
                        price_value = float(clean_price)
                    except ValueError:
                        price_value = 0
            
            prices = []
            if price_value and price_value > 0:
                prices.append({
                    'amount': price_value,
                    'currency': pricing.get('currency', 'BRL')
                })

            price_set_id = None
            if prices:
                price_set_id = create_price_set(conn, prices)
                if not price_set_id:
                    print(f"⚠️  Pulando produto {title} - preço inválido")
                    return None  # Não insere produto sem preço válido

            # Metadata
            metadata = {
                'manufacturer': product_data.get('manufacturer', ''),
                'model': product_data.get('model', ''),
                'source': product_data.get('source', ''),
                'availability': product_data.get('availability', ''),
                'technical_specs': product_data.get('technical_specs', {}),
                'processed_images': product_data.get('processed_images', {}),
                'original_data': product_data
            }

            # Insere produto
            cur.execute("""
                INSERT INTO product (
                    id, title, handle, subtitle, description, status, thumbnail,
                    type_id, discountable, external_id, metadata, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                product_id, title, handle, product_data.get('model', ''),
                description, 'published', thumbnail, type_id, True,
                product_data.get('id', ''), Json(metadata)
            ))

            # Insere variante
            cur.execute("""
                INSERT INTO product_variant (
                    id, title, sku, product_id, variant_rank, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                variant_id, f"{title} - Padrão", product_data.get('id', f"sku-{variant_id}"),
                product_id, 0
            ))

            # Vincula preço à variante
            if price_set_id:
                cur.execute("""
                    INSERT INTO product_variant_price_set (variant_id, price_set_id, id, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                """, (variant_id, price_set_id, str(uuid.uuid4())))

            # Vincula categoria
            if category_id:
                cur.execute("""
                    INSERT INTO product_category_product (product_id, product_category_id)
                    VALUES (%s, %s)
                """, (product_id, category_id))

            # Insere imagens
            images = product_data.get('processed_images', {})
            for img_type, img_path in images.items():
                if img_path and isinstance(img_path, str):
                    img_id = str(uuid.uuid4())
                    cur.execute("""
                        INSERT INTO image (id, url, product_id, created_at, updated_at)
                        VALUES (%s, %s, %s, NOW(), NOW())
                    """, (img_id, img_path, product_id))

            conn.commit()
            print(f"✅ Produto inserido: {title}")
            return product_id

    except Exception as e:
        print(f"❌ Erro ao inserir produto {product_data.get('name', 'desconhecido')}: {e}")
        conn.rollback()
        return None

def load_catalog_data():
    """Carrega dados dos arquivos JSON do catálogo"""
    all_products = []

    for data_dir in DATA_DIRS:
        if os.path.exists(data_dir):
            print(f"📂 Carregando dados de: {data_dir}")

            # Encontra todos os arquivos JSON
            json_files = glob.glob(os.path.join(data_dir, '*.json'))

            for json_file in json_files:
                try:
                    print(f"📄 Lendo: {os.path.basename(json_file)}")

                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)

                        # Se for uma lista, adiciona todos os itens
                        if isinstance(data, list):
                            all_products.extend(data)
                        # Se for um objeto único, adiciona como lista
                        else:
                            all_products.append(data)

                except Exception as e:
                    print(f"❌ Erro ao ler {json_file}: {e}")

    print(f"📊 Total de produtos carregados: {len(all_products)}")
    return all_products

def main():
    """Função principal"""
    print("🚀 Iniciando inserção de dados do catálogo YSH no PostgreSQL")

    # Carrega dados
    products = load_catalog_data()

    if not products:
        print("❌ Nenhum produto encontrado para inserir")
        return

    # Conecta ao banco
    conn = connect_db()
    if not conn:
        return

    try:
        # Insere produtos
        inserted_count = 0
        for product in products[:50]:  # Limita a 50 produtos para teste
            if insert_product(conn, product):
                inserted_count += 1

        print(f"✅ Inserção concluída! {inserted_count} produtos inseridos com sucesso")

    except Exception as e:
        print(f"❌ Erro geral: {e}")

    finally:
        conn.close()
        print("🔌 Conexão com banco fechada")

if __name__ == "__main__":
    main()