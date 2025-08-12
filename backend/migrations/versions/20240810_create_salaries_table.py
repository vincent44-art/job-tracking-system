"""
Revision ID: create_salaries_table
Revises = None
Create Date: 2025-08-10
"""
revision = 'create_salaries_table'
down_revision = None
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'salaries',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('user.id'), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('description', sa.String(255)),
        sa.Column('date', sa.Date)
    )

def downgrade():
    op.drop_table('salaries')
