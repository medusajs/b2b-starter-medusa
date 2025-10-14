"""Seed script to populate initial data in the database."""

from app.database import SessionLocal, create_tables
from app.database.models import Distributor, User
from app.services.auth_service import get_password_hash


def seed_database():
    """Seed the database with initial data."""
    # Create tables if they don't exist
    create_tables()

    db = SessionLocal()

    try:
        # Check if distributors already exist
        existing_distributors = db.query(Distributor).count()
        if existing_distributors > 0:
            print("Database already seeded. Skipping...")
            return

        # Create distributors
        distributors_data = [
            {
                "name": "CPFL Energia",
                "code": "CPFL",
                "region": "São Paulo",
                "contact_email": "contato@cpfl.com.br",
                "contact_phone": "+55 11 1234-5678",
                "service_area": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-46.8254, -23.5505],  # São Paulo bounds approximation
                        [-46.3654, -23.5505],
                        [-46.3654, -23.3505],
                        [-46.8254, -23.3505],
                        [-46.8254, -23.5505]
                    ]]
                }
            },
            {
                "name": "Enel São Paulo",
                "code": "ENEL_SP",
                "region": "São Paulo",
                "contact_email": "contato@enel.com.br",
                "contact_phone": "+55 11 2345-6789",
                "service_area": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-46.8254, -23.5505],
                        [-46.3654, -23.5505],
                        [-46.3654, -23.3505],
                        [-46.8254, -23.3505],
                        [-46.8254, -23.5505]
                    ]]
                }
            },
            {
                "name": "CEMIG",
                "code": "CEMIG",
                "region": "Minas Gerais",
                "contact_email": "contato@cemig.com.br",
                "contact_phone": "+55 31 3456-7890",
                "service_area": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-44.0, -19.0],  # Minas Gerais bounds approximation
                        [-40.0, -19.0],
                        [-40.0, -14.0],
                        [-44.0, -14.0],
                        [-44.0, -19.0]
                    ]]
                }
            }
        ]

        distributors = []
        for dist_data in distributors_data:
            distributor = Distributor(**dist_data)
            db.add(distributor)
            distributors.append(distributor)

        db.commit()

        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@haasplatform.com",
            hashed_password=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin_user)

        # Create distributor users
        for distributor in distributors:
            distributor_user = User(
                username=f"dist_{distributor.code.lower()}",
                email=f"distributor@{distributor.code.lower()}.com",
                hashed_password=get_password_hash("dist123"),
                role="distributor",
                distributor_id=distributor.id,
                is_active=True
            )
            db.add(distributor_user)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()