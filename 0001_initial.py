"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2025-08-08

"""
from alembic import op
import sqlalchemy as sa

revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('merchants',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('kyc_status', sa.String(), default='pending'),
        sa.Column('tax_rate_default', sa.String(), nullable=True),
        sa.Column('tip_suggestions', sa.String(), nullable=True),
    )

    op.create_table('locations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('tax_rate', sa.String(), nullable=True),
    )

    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('role', sa.String(), default='staff'),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id'), nullable=True),
    )

    op.create_table('user_locations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=False),
    )

    op.create_table('products',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('price_cents', sa.Integer(), nullable=False),
        sa.Column('sku', sa.String(), unique=True, nullable=True),
        sa.Column('active', sa.Boolean(), default=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
    )

    op.create_table('transactions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id')),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(), default='USD'),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('status', sa.String(), default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('tax_cents', sa.Integer(), default=0),
        sa.Column('tip_cents', sa.Integer(), default=0),
        sa.Column('discount_cents', sa.Integer(), default=0),
        sa.Column('total_cents', sa.Integer(), default=0),
    )

    op.create_table('checkout_links',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('token', sa.String(), unique=True, index=True),
        sa.Column('merchant_id', sa.String(), sa.ForeignKey('merchants.id')),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('currency', sa.String(), default='USD'),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('paid', sa.Boolean(), default=False),
        sa.Column('transaction_id', sa.String(), sa.ForeignKey('transactions.id'), nullable=True),
    )

def downgrade():
    op.drop_table('checkout_links')
    op.drop_table('transactions')
    op.drop_table('products')
    op.drop_table('user_locations')
    op.drop_table('users')
    op.drop_table('locations')
    op.drop_table('merchants')
