# multi-tenant-starter

> Multi-tenant data isolation — **without writing a single tenant filter in your queries.**

---

## The Problem

Every multi-tenant app eventually has this bug:

```ts
// Oops — forgot the tenant filter. Tenant A just saw Tenant B's data.
const items = await db.query('SELECT * FROM records');
```

The usual fix is discipline: remember to add `WHERE tenant_id = $1` everywhere.  
That's not a fix. That's a time bomb.

---

## What This Does

This repo proves a better model: **tenant context is resolved once, at the boundary**, and the rest of your code never has to think about it.

- Tenant is extracted from the URL **or** a request header — one place, one time  
- The data layer enforces isolation by construction — no filter, no leak  
- Route handlers are completely tenant-agnostic  

---

## Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-org/multi-tenant-starter
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

### Prove isolation — Tenant B sees nothing from Tenant A

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
  "items": ["acme — first record", "acme — second record"]
}

// GET /tenant/globex/data
{
  "tenant": "globex",
  "count": 2,
  "items": ["globex — first record", "globex — second record"]
}
```

Different data. Same code. Zero tenant filters.

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

## The Key Insight

Look at the route handler:

```ts
router.get('/', (req, res) => {
  const items = getData(req.tenant); // ← that's it. no filter. no leak.
  res.json({ tenant: req.tenant, items });
});
```

The isolation is structural, not a convention you have to remember.

---

## Swap the DB Layer

The in-memory store is intentionally trivial. To use a real database, replace `src/lib/db.ts` — the rest of the app doesn't change.

With Postgres + Row Level Security, for example, `getData(tenant)` would set `SET app.tenant = $1` and let RLS policies handle the rest. Same guarantee. Production scale.

---

## License

MIT
