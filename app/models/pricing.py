from sqlalchemy import Column, String, Integer, DECIMAL, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class PricingDetail(Base):
    __tablename__ = "pricing_details"

    pricing_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    staffing_id = Column(UUID(as_uuid=True), ForeignKey("staffing_details.staffing_id", ondelete="CASCADE"), nullable=False)
    cost = Column(DECIMAL(12, 2))
    sale_price = Column(DECIMAL(12, 2))

    # Relationships
    staffing = relationship("Staffing", back_populates="pricing")