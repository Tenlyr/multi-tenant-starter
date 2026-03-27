# multi-tenant-starter

>  Multi-tenant data isolation - **without writing a single tenant filter in your queries.**

---
![npm](https://img.shields.io/npm/v/@tenlyr/sdk)
![License](https://img.shields.io/badge/license-MIT-blue)
![Provision time](https://img.shields.io/badge/provision%20time-187ms-brightgreen)

> ⭐ If this saves you from a tenant data leak, star it.

## The Problem

Every multi-tenant app eventually has this bug:

```ts
// Oops - forgot the tenant filter. Tenant A just saw Tenant B's data.
const items = await db.query('SELECT * FROM records');
```

The usual fix is discipline: remember to add `WHERE tenant_id = $1` everywhere.  
That's not a fix.  
It's a silent data leak waiting to happen.

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/Tenlyr/multi-tenant-starter
cd multi-tenant-starter
npm install

# 2. Configure
cp .env.example .env
# → Add your TENLYR_ADMIN_KEY

# 3. Provision demo tenants
npm run provision

# 4. Start the server
npm run dev
```

Server runs on **http://localhost:3000**.

Takes ~2 minutes to run end-to-end.
Works locally. No external setup required.

---

## 1-minute test

```bash
curl http://localhost:3000/tenant/acme/data
curl http://localhost:3000/tenant/globex/data
```

Same endpoint. Different data. No tenant filters.

---

## Demo API

### Write data for a tenant

```bash
curl -X POST http://localhost:3000/tenant/acme/data \
  -H "Content-Type: application/json" \
  -d '{"value": "hello from acme"}'
```

### Read it back

```bash
curl http://localhost:3000/tenant/acme/data
```

### Prove isolation - Tenant B sees nothing from Tenant A

```bash
curl http://localhost:3000/tenant/globex/data
```

### Debug: see resolved tenant context

```bash
curl http://localhost:3000/debug/context \
  -H "x-tenant-id: acme"
```

---

## Example Output

```json
// GET /tenant/acme/data
{
  "tenant": "acme",
  "count": 2,
  "items": ["acme - first record", "acme - second record"]
}

// GET /tenant/globex/data
{
  "tenant": "globex",
  "count": 0,
  "items": []
}
```

Different data. Same code. Zero tenant filters.

---

## How it works

**Tenant context is resolved once, at the boundary** - the rest of your code never has to think about it.

- Tenant is extracted from the URL **or** a request header - one place, one time  
- The data layer enforces isolation by construction - no filter, no leak  
- Route handlers are completely tenant-agnostic  

---

Once this clicks, you'll never want to write tenant filters again.

## The Key Insight

Look at the route handler:

```ts
router.get('/', (req, res) => {
  // Notice:
  // No tenant_id filter anywhere.
  // Isolation is enforced by design.
  const items = getData(req.tenant);
  res.json({ tenant: req.tenant, items });
});
```

The isolation is structural, not a convention you have to remember.

---

## Project Structure

```
src/
  server.ts           # Express app + route mounting
  client.ts           # Tenlyr SDK init (fails loudly if key missing)
  middleware/
    tenancy.ts        # Resolves tenant from URL or header → req.tenant
  lib/
    db.ts             # Isolated in-memory store — isolation by construction
  routes/
    data.ts           # GET + POST handlers (no tenant logic here!)

scripts/
  provision.ts        # Creates demo tenants + seeds data
```

---

## Swap the DB Layer

The in-memory store is intentionally trivial. To use a real database, replace `src/lib/db.ts` - the rest of the app doesn't change.

With Postgres + Row Level Security, for example, `getData(tenant)` would set `SET app.tenant = $1` and let RLS policies handle the rest. Same guarantee. Production scale.

---

Multi-tenancy shouldn't depend on developers remembering things.
It should be enforced by design.

---
## Ready for production?

This starter shows the pattern. 
Tenlyr gives you the full infrastructure:

| This starter | Tenlyr |
|---|---|
| In-memory store | Real Postgres + RLS |
| Manual provisioning | 187ms automated provisioning |
| No billing | Stripe sync built-in |
| No monitoring | Per-tenant health dashboard |
| Demo only | Production-ready |

→ **[Start free at tenlyr.com](https://tenlyr.com)** — 
provision your first real tenant in 30 minutes.


## License
MIT

---

Built by [Rajesh Ayyavu](https://linkedin.com/in/rajesh-ayyavu) 
· [tenlyr.com](https://tenlyr.com) 
· [Follow for more multi-tenancy content](https://linkedin.com/in/rajesh-ayyavu)
```

