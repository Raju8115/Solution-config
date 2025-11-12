from uuid import UUID
from pydantic import BaseModel


class CountryBase(BaseModel):
    country_name: str


class CountryCreate(CountryBase):
    pass


class Country(CountryBase):
    country_id: UUID

    class Config:
        from_attributes = True