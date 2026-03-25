# Ship your SaaS. Not infrastructure.

This repo shows how to enforce multi-tenant isolation
without relying on developers to remember filters.

## The problem

Most SaaS apps:
- rely on tenant_id filters
- break when one query misses it
- leak data silently

## What this does

- resolves tenant from request
- enforces isolation at system level
- prevents cross-tenant data access

## Quick start

```bash
npm install
npm run dev
