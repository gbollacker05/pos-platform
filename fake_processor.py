# Placeholder for a payment gateway.
# Replace with real integration (e.g., Stripe) when ready.

from dataclasses import dataclass
from random import random

@dataclass
class AuthResult:
    approved: bool
    auth_id: str
    decline_reason: str | None = None

def authorize(amount_cents: int, currency: str = "USD") -> AuthResult:
    # 90% approval rate for demo
    if random() < 0.9:
        return AuthResult(True, auth_id="auth_demo_123")
    return AuthResult(False, auth_id="auth_demo_123", decline_reason="insufficient_funds")

def refund(auth_id: str, amount_cents: int):
    # Assume refunds always succeed in demo
    return True
