"""merge heads for other_expenses table

Revision ID: b55d390a7cf7
Revises: 20240607_add_assignment_id_to_sale, a39e6364c901
Create Date: 2025-08-10 11:13:35.900645

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b55d390a7cf7'
down_revision = ('20240607_add_assignment_id_to_sale', 'a39e6364c901')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
