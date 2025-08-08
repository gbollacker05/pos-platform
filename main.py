from fastapi import FastAPI
from .routers import merchants, products, transactions, webhooks

app = FastAPI(title="Payments POS MVP", version="0.1.0")

app.include_router(merchants.router, prefix="/merchants", tags=["merchants"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

@app.get("/", tags=["health"])
def health():
    return {"status": "ok"}
