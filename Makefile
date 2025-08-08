SHELL := /bin/bash

.PHONY: dev up down logs migrate seed test build

dev:
	cd ../payments-pos-mvp/backend && uvicorn app.main:app --reload

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

migrate:
	cd ../payments-pos-mvp/backend && ALEMBIC_CONFIG=../../production-bundle/alembic.ini alembic upgrade head

seed:
	cd ../payments-pos-mvp/backend && python scripts/seed.py

test:
	cd ../payments-pos-mvp/backend && pytest -q

build:
	docker compose build --no-cache
