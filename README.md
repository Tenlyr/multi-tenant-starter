# Ship your SaaS. Not infrastructure.

Enforce multi-tenant isolation  
without relying on developers to remember filters.

## The problem

Most SaaS apps:

- rely on tenant_id filters  
- break when one query misses it  
- leak data silently  

## What this does

- resolve tenant from request  
- inject context automatically  
- enforce isolation at query level  

## Example

Tenant A → sees only A data  
Tenant B → sees only B data  

No filters required in queries.

## Demo

createTenant("acme")

✔ Tenant created  
✔ Context set  
✔ Data isolated  
✔ Ready in <200ms

## Quick start

```bash
npm install
npm run dev
