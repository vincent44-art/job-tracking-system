"""merge heads

Revision ID: 195773a5eee0
Revises: create_salaries_table, 4dcc233492e3
Create Date: 2025-08-10 17:57:29.878496

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '195773a5eee0'
down_revision = ('create_salaries_table', '4dcc233492e3')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
