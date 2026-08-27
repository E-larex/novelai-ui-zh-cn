.PHONY: setup build test lint typecheck check

setup:
	npm ci

build:
	npm run build

test:
	npm test

lint:
	npm run lint

typecheck:
	npm run typecheck

check:
	npm run check
