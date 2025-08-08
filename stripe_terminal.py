import os
import stripe

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

def create_connection_token():
    if not STRIPE_SECRET_KEY:
        return {"secret": "demo_connection_token"}  # placeholder for local dev
    return stripe.terminal.ConnectionToken.create()

def create_card_present_intent(amount_cents: int, currency: str = "USD", merchant: str | None = None):
    if not STRIPE_SECRET_KEY:
        return {"id": "pi_demo", "client_secret": "pi_demo_secret", "status": "requires_payment_method"}
    return stripe.PaymentIntent.create(
        amount=amount_cents,
        currency=currency,
        payment_method_types=["card_present"],
        capture_method="automatic",
        metadata={"merchant_id": merchant or ""},
    )
