import os
import stripe

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

def create_checkout_session(amount_cents: int, currency: str, description: str, success_url: str, cancel_url: str):
    if not STRIPE_SECRET_KEY:
        # Fallback demo URL
        return {"url": f"{success_url}?demo=1", "id": "cs_demo"}
    session = stripe.checkout.Session.create(
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": currency,
                "product_data": {"name": description or "Payment"},
                "unit_amount": amount_cents,
            },
            "quantity": 1
        }],
        success_url=success_url,
        cancel_url=cancel_url,
    )
    return {"url": session.url, "id": session.id}
