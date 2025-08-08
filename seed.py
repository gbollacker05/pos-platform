from app.database import engine, Base, SessionLocal
from app.models import Merchant, Product

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Seed merchant
merchant = Merchant(id="m_demo", name="Demo Coffee", kyc_status="verified")
if not db.get(Merchant, "m_demo"):
    db.add(merchant)

# Seed products
products = [
    Product(name="Latte", price_cents=499, sku="LATTE"),
    Product(name="Americano", price_cents=399, sku="AMER"),
    Product(name="Mocha", price_cents=549, sku="MOCHA"),
]
for p in products:
    exists = db.query(Product).filter_by(name=p.name).first()
    if not exists:
        db.add(p)

db.commit()
db.close()
print("Seeded demo data.")
