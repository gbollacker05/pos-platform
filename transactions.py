from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..deps import get_db
from ..services import fake_processor
import uuid

router = APIRouter()

@router.post("/create", response_model=schemas.TransactionOut)
def create_transaction(payload: schemas.TransactionCreate, db: Session = Depends(get_db)):
    # ensure merchant exists
    merchant = db.get(models.Merchant, payload.merchant_id)
    if not merchant:
        raise HTTPException(status_code=400, detail="Invalid merchant_id")

    # create local record (pending)
    txn_id = "txn_" + uuid.uuid4().hex[:10]
    txn = models.Transaction(
        id=txn_id,
        merchant_id=payload.merchant_id,
        amount=payload.amount,
        currency=payload.currency,
        description=payload.description,
        status="pending",
    )
    db.add(txn); db.commit(); db.refresh(txn)

    # AUTH with gateway (fake for now)
    auth = fake_processor.authorize(payload.amount, payload.currency)
    if auth.approved:
        txn.status = "approved"
    else:
        txn.status = "declined"
    db.add(txn); db.commit(); db.refresh(txn)
    return txn

@router.post("/{transaction_id}/refund", response_model=schemas.TransactionOut)
def refund_transaction(transaction_id: str, db: Session = Depends(get_db)):
    txn = db.get(models.Transaction, transaction_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved transactions can be refunded")

    # Call gateway refund (fake)
    ok = fake_processor.refund("auth_demo_123", txn.amount)
    if not ok:
        raise HTTPException(status_code=502, detail="Refund failed at processor")

    txn.status = "refunded"
    db.add(txn); db.commit(); db.refresh(txn)
    return txn
