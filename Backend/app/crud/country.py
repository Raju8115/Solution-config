from sqlalchemy.orm import Session
from app.models.country import Country
from typing import List


def get_countries(db: Session) -> List[Country]:
    return db.query(Country).all()