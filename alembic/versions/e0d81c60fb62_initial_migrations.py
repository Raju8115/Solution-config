"""initial migrations

Revision ID: e0d81c60fb62
Revises: ac7f007f2828
Create Date: 2025-11-26 19:05:09.470836

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'e0d81c60fb62'
down_revision: Union[str, Sequence[str], None] = 'ac7f007f2828'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - TRUNCATES staffing_details table."""
    
    # Truncate existing data to avoid NOT NULL constraint violation
    op.execute('TRUNCATE TABLE staffing_details RESTART IDENTITY CASCADE')
    
    # Add activity_id column
    op.add_column(
        'staffing_details', 
        sa.Column('activity_id', sa.UUID(), nullable=False)
    )
    
    # Add foreign key
    op.create_foreign_key(
        'fk_staffing_details_activity_id',
        'staffing_details', 
        'activities', 
        ['activity_id'], 
        ['activity_id'], 
        ondelete='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_staffing_details_activity_id', 'staffing_details', type_='foreignkey')
    op.drop_column('staffing_details', 'activity_id')