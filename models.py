from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import DateTime
from datetime import datetime
from .database import Base

class Merchant(Base):
    __tablename__ = "merchants"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    kyc_status = Column(String, default="pending")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    price_cents = Column(Integer, nullable=False)
    sku = Column(String, index=True, unique=True, nullable=True)
    active = Column(Boolean, default=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"))
    amount = Column(Integer, nullable=False)
    currency = Column(String, default="USD")
    description = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, approved, declined, refunded
    created_at = Column(DateTime, default=datetime.utcnow)
