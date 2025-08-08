from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import Base, engine
from ..deps import get_db

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("", response_model=schemas.MerchantOut)
def create_merchant(merchant: schemas.MerchantCreate, db: Session = Depends(get_db)):
    existing = db.get(models.Merchant, merchant.id)
    if existing:
        raise HTTPException(status_code=400, detail="Merchant already exists")
    m = models.Merchant(id=merchant.id, name=merchant.name, kyc_status="verified")
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.get("/{merchant_id}", response_model=schemas.MerchantOut)
def get_merchant(merchant_id: str, db: Session = Depends(get_db)):
    m = db.get(models.Merchant, merchant_id)
    if not m:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return m
