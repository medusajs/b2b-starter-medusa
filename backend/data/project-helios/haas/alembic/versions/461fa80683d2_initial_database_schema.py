"""Initial database schema

Revision ID: 461fa80683d2
Revises: 
Create Date: 2025-10-14 04:48:50.088446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '461fa80683d2'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


"""Initial database schema

Revision ID: 461fa80683d2
Revises: 
Create Date: 2025-10-14 04:48:50.088446

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '461fa80683d2'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create distributors table
    op.create_table('distributors',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('region', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='active'),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('contact_phone', sa.String(length=50), nullable=True),
        sa.Column('service_area', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('(datetime(\'now\'))')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('(datetime(\'now\'))')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_distributors_code'), 'distributors', ['code'], unique=True)
    op.create_index(op.f('ix_distributors_id'), 'distributors', ['id'], unique=False)

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='distributor'),
        sa.Column('distributor_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('(datetime(\'now\'))')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('(datetime(\'now\'))')),
        sa.ForeignKeyConstraint(['distributor_id'], ['distributors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # Create webhook_configs table
    op.create_table('webhook_configs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=False),
        sa.Column('secret', sa.String(length=255), nullable=False),
        sa.Column('event_types', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_webhook_configs_id'), 'webhook_configs', ['id'], unique=False)

    # Create connection_requests table
    op.create_table('connection_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.String(length=36), nullable=False),
        sa.Column('distributor_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('connection_type', sa.String(length=20), nullable=False),
        sa.Column('voltage_level', sa.String(length=50), nullable=False),
        sa.Column('power_requirement', sa.Float(), nullable=False),
        sa.Column('location', sa.JSON(), nullable=True),
        sa.Column('location_geom', geoalchemy2.Geometry(geometry_type='POINT', srid=4326, from_text='ST_GeomFromEWKT', name='geometry'), nullable=True),
        sa.Column('equipment', sa.JSON(), nullable=True),
        sa.Column('documents', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('estimated_cost', sa.Float(), nullable=True),
        sa.Column('estimated_time_days', sa.Integer(), nullable=True),
        sa.Column('requirements', sa.JSON(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('inmetro_validation_result', sa.JSON(), nullable=True),
        sa.Column('inmetro_valid', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['distributor_id'], ['distributors.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_connection_requests_distributor_id'), 'connection_requests', ['distributor_id'], unique=False)
    op.create_index(op.f('ix_connection_requests_id'), 'connection_requests', ['id'], unique=False)
    op.create_index(op.f('ix_connection_requests_request_id'), 'connection_requests', ['request_id'], unique=True)

    # Create webhook_deliveries table
    op.create_table('webhook_deliveries',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('config_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('signature', sa.String(length=255), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_attempts', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('response_status', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('delivered_at', sa.DateTime(), nullable=True),
        sa.Column('next_retry_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['config_id'], ['webhook_configs.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_webhook_deliveries_config_id'), 'webhook_deliveries', ['config_id'], unique=False)
    op.create_index(op.f('ix_webhook_deliveries_id'), 'webhook_deliveries', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_table('webhook_deliveries')
    op.drop_table('connection_requests')
    op.drop_table('webhook_configs')
    op.drop_table('users')
    op.drop_table('distributors')

    # Drop PostGIS extension
    op.execute("DROP EXTENSION IF EXISTS postgis;")
