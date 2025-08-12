"""
Add assignment_id foreign key to Sale model
"""
from alembic import op
import sqlalchemy as sa
revision = '20240607_add_assignment_id_to_sale'
down_revision = None  # Set to previous migration revision string if exists
branch_labels = None
depends_on = None
def upgrade():
    op.add_column('sale', sa.Column('assignment_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_sale_assignment', 'sale', 'assignment', ['assignment_id'], ['id'])

def downgrade():
    op.drop_constraint('fk_sale_assignment', 'sale', type_='foreignkey')
    op.drop_column('sale', 'assignment_id')
