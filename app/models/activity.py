from sqlalchemy import Column, ForeignKey, String, Text, Integer, Boolean, DECIMAL, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Activity(Base):
    __tablename__ = "activities"
    
    activity_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    offering_id = Column(UUID(as_uuid=True), ForeignKey("offerings.offering_id", ondelete="CASCADE"), nullable=True)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.brand_id", ondelete="CASCADE"), nullable=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=True)
    activity_name = Column(String(255), nullable=False)
    category = Column(String(100))
    part_numbers = Column(String(100))
    duration_weeks = Column(Integer)
    duration_hours = Column(Integer)
    sequence = Column(Integer)
    is_mandatory = Column(Boolean, default=True)
    outcome = Column(Text)
    description = Column(Text)
    effort_hours = Column(Integer)
    fixed_price = Column(DECIMAL(12, 2))
    created_on = Column(TIMESTAMP, server_default=func.now())
    updated_on = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    client_responsibilities = Column(Text)
    ibm_responsibilities = Column(Text)
    assumptions = Column(Text)
    deliverables = Column(Text)
    completion_criteria = Column(Text)
    
    # Relationships
    offering = relationship("Offering", back_populates="activities_direct")
    brand = relationship("Brand", back_populates="activities")
    product = relationship("Product", back_populates="activities")
    offerings = relationship(
        "OfferingActivity",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    wbs_entries = relationship(
        "ActivityWBS",
        back_populates="activity",
        cascade="all, delete-orphan",
        passive_deletes=True
    )


class OfferingActivity(Base):
    """Junction table for many-to-many relationship between offerings and activities"""
    __tablename__ = "offering_activities"
    
    offering_id = Column(UUID(as_uuid=True), ForeignKey("offerings.offering_id", ondelete="CASCADE"), primary_key=True)
    activity_id = Column(UUID(as_uuid=True), ForeignKey("activities.activity_id", ondelete="CASCADE"), primary_key=True)
    sequence = Column(Integer)
    is_mandatory = Column(Boolean, default=True)
    created_on = Column(TIMESTAMP, server_default=func.now())
    
    # Relationships
    offering = relationship("Offering", back_populates="activities")
    activity = relationship("Activity", back_populates="offerings")
