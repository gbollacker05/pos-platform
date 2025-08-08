from fastapi import APIRouter, Request
router = APIRouter()

@router.post("/gateway")
async def gateway_webhook(req: Request):
    # In production, verify signature headers using your gateway's SDK
    event = await req.json()
    # Process events like payment_intent.succeeded, charge.refunded, etc.
    return {"received": True, "event_type": event.get("type")}
