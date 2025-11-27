from sqlalchemy import Column, String, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Staffing(Base):
    """Master table for staffing roles (country, role, band combinations)"""
    __tablename__ = "staffing_details"
    __table_args__ = (
        UniqueConstraint('country', 'role', 'band', name='unique_country_role_band_staffing'),
    )

    staffing_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    country = Column(String(50), nullable=False)
    role = Column(String(100), nullable=False)
    band = Column(Integer, nullable=False)

    # Relationships
    pricing = relationship("PricingDetail", back_populates="staffing", cascade="all, delete-orphan", passive_deletes=True)
    wbs_staffing = relationship("WBSStaffing", back_populates="staffing", cascade="all, delete-orphan", passive_deletes=True)