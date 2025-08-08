from pydantic import BaseModel, Field
from typing import Optional

class MerchantCreate(BaseModel):
    id: str
    name: str

class MerchantOut(BaseModel):
    id: str
    name: str
    kyc_status: str

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    price_cents: int
    sku: Optional[str] = None
    active: bool = True

class ProductOut(ProductCreate):
    id: int
    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    merchant_id: str
    amount: int = Field(gt=0)
    currency: str = "USD"
    description: Optional[str] = None

class TransactionOut(BaseModel):
    id: str
    merchant_id: str
    amount: int
    currency: str
    description: Optional[str] = None
    status: str
    class Config:
        from_attributes = True
