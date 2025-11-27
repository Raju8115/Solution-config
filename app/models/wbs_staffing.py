from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class WBSStaffing(Base):
    """Junction table for many-to-many relationship between WBS and Staffing"""
    __tablename__ = "wbs_staffing"
    
    wbs_id = Column(UUID(as_uuid=True), ForeignKey("wbs.wbs_id", ondelete="CASCADE"), primary_key=True)
    staffing_id = Column(UUID(as_uuid=True), ForeignKey("staffing_details.staffing_id", ondelete="CASCADE"), primary_key=True)
    hours = Column(Integer)
    
    # Relationships
    wbs = relationship("WBS", back_populates="staffing_entries")
    staffing = relationship("Staffing", back_populates="wbs_staffing")

# Made with Bob
