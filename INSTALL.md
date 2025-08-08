# Production Install Guide

This bundle gives you everything you need to run the **Payments POS** stack in production (or a solid staging).

## Stack overview
- **FastAPI API** (Gunicorn + Uvicorn workers)
- **Postgres 15**
- **React (Vite) dashboard** served by **Nginx**
- **Nginx reverse proxy** (`/` → dashboard, `/api` → backend)
- **Alembic** migrations
- **Stripe** (Checkout + Terminal scaffolds)
- **JWT auth**

## Prereqs
- Docker + docker-compose
- A domain name (e.g., `pos.example.com`)
- (Recommended) A TLS terminator / LB that handles HTTPS (e.g., Cloudflare, AWS ALB) → forward to port 80 of the `proxy`

## Quick start (staging)
```bash
# 1) Put the repo structure side-by-side like:
#   production-bundle/
#   payments-pos-mvp/
#   web-dashboard-mvp/

cd production-bundle
cp env/api.env.example env/api.env
cp env/web.env.example env/web.env

# Edit env files (JWT_SECRET, Stripe keys, etc.)
make up
make migrate
make seed

# Tail logs
make logs
```
Open the site at `http://localhost`

## Environment variables (critical)
- `JWT_SECRET` — generate a long random string (32+ bytes)
- `DATABASE_URL` — filled for docker compose; change if using external Postgres
- `CORS_ORIGINS` — set to your dashboard origin (`https://pos.example.com`)
- `STRIPE_SECRET_KEY` — live or test key from Stripe
- `STRIPE_WEBHOOK_SECRET` — if using webhooks
- `APP_ENV` — `prod`

## Stripe setup
- **Checkout**: Use `/checkout/stripe_session` from the dashboard page. Configure allowed **redirect URLs** in Stripe.
- **Terminal**: In test mode, create readers and use `/payments/terminal/*`. For Expo mobile, eject to Bare to add the native module (see `TERMINAL_NOTES.md`).

## PCI & security checklist (non-exhaustive)
- Use **Stripe-hosted** collection (Checkout/Terminal) to minimize PCI scope.
- Serve **HTTPS** end-to-end. Terminate TLS at your edge.
- Rotate **JWT_SECRET** and database creds; store them in your secrets manager.
- Enable DB backups + **point-in-time recovery**.
- Configure **webhook signature verification** for Stripe.
- Add **rate limiting** and **request size limits** at the proxy or app layer.
- Audit & log admin actions (refunds, location changes).

## Backups & migrations
- Run `make migrate` on deploy.
- Use managed Postgres if possible (RDS, Cloud SQL).
- Snapshot volumes regularly (db_data).

## CI/CD
- GitHub Actions workflow runs tests and builds images.
- Add your container registry login + push steps.

## Common issues
- CORS errors → update `CORS_ORIGINS` to your dashboard URL.
- 502 on `/api` → `api` container not healthy or migrations not run.
- Stripe keys missing → Checkout/Terminal fall back to demo behavior.

---

Need help deploying on AWS/ECS, Fly.io, or Render? I can generate infra-as-code next.
