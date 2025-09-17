"""create seller_fruits table

Revision ID: ae1234567890
Revises: df96c6c8ab11
Create Date: 2024-06-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ae1234567890'
down_revision = 'df96c6c8ab11'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'seller_fruits',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('fruit_name', sa.String(length=50), nullable=False),
        sa.Column('qty', sa.Float, nullable=False),
        sa.Column('unit_price', sa.Float, nullable=False),
        sa.Column('date', sa.Date, nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('seller_fruits')
