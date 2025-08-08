# Web Dashboard MVP

React + Vite + Tailwind dashboard for the Payments POS MVP.

## Quickstart
```bash
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173


## Auth
Sign in at `/login` using seeded credentials:
- admin@example.com / admin123
- barista@example.com / coffee123

## Stripe Terminal (scaffold)
The backend exposes:
- `POST /payments/terminal/connection_token`
- `POST /payments/terminal/payment_intents`
Set `STRIPE_SECRET_KEY` in backend `.env` to use real Stripe. Otherwise demo stubs are returned.


## Locations & Role-based UI
- Transactions page shows a **Location** filter and hides **Refund** when logged-in user is not an **admin**.
- Products form includes a **Location** selector for location-aware creation.

## Hosted Checkout
Create links in **Checkout Links** and share the public page. The backend serves a minimal HTML page at `/checkout/{token}/page` for demo.
