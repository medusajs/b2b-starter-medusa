import json
import os
import psycopg2
from psycopg2.extras import execute_values

def main():
    # Database connection - adjust these parameters as needed
    try:
        conn = psycopg2.connect(
            host='localhost',
            port=15432,
            database='medusa_db',
            user='medusa_user',
            password='medusa_password'
        )
        cursor = conn.cursor()
        print('✅ Connected to database')
    except Exception as e:
        print(f'❌ Error connecting to database: {e}')
        return

    # Read catalog data
    catalog_dir = 'data/catalog'
    files_to_process = [
        ('kits.json', 'kits'),
        ('panels.json', 'panels'),
        ('inverters.json', 'inverters'),
        ('cables.json', 'cables')
    ]

    total_processed = 0

    for file_name, category in files_to_process:
        file_path = os.path.join(catalog_dir, file_name)
        if not os.path.exists(file_path):
            print(f'⚠️  File {file_path} not found')
            continue

        print(f'📁 Processing {file_name}...')

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

                # Handle different data structures
                if isinstance(data, dict) and 'panels' in data:
                    items = data['panels']
                elif isinstance(data, list):
                    items = data
                else:
                    print(f'⚠️  Unexpected data structure in {file_name}')
                    continue

                print(f'📊 Found {len(items)} items in {file_name}')

                # Process first 5 items for testing
                for item in items[:5]:
                    title = item.get('name') or item.get('model') or f"{item.get('manufacturer', 'Unknown')} {item.get('id', 'Unknown')}"
                    price_str = item.get('price', '')

                    # Parse price
                    price = 0
                    if price_str:
                        try:
                            # Remove currency symbols and convert
                            cleaned = price_str.replace('R$', '').replace(' ', '').replace(',', '').replace('.', '')
                            price = int(cleaned)
                        except:
                            pass

                    print(f'🔄 Processing: {title} - Price: {price}')

                    # Insert into database using Medusa's product table structure
                    try:
                        # First, create the product
                        cursor.execute('''
                            INSERT INTO product (title, description, status, created_at, updated_at)
                            VALUES (%s, %s, %s, NOW(), NOW())
                            RETURNING id
                        ''', (title, item.get('description', ''), 'published'))

                        result = cursor.fetchone()
                        if result:
                            product_id = result[0]
                        else:
                            print('❌ No ID returned from insert')
                            continue

                        # Create product categories relationship if category exists
                        # This is simplified - you'll need to adjust based on your actual schema
                        print(f'✅ Created product with ID: {product_id}')

                        total_processed += 1
                        conn.commit()

                    except Exception as e:
                        print(f'❌ Error inserting product: {e}')
                        conn.rollback()

        except json.JSONDecodeError as e:
            print(f'❌ Error parsing {file_name}: {e}')
        except Exception as e:
            print(f'❌ Error processing {file_name}: {e}')

    cursor.close()
    conn.close()
    print(f'✅ Done! Processed {total_processed} products')

if __name__ == '__main__':
    main()