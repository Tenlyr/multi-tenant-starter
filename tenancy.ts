/**
 * src/demo/server.ts
 *
 * A minimal HTTP server demonstrating multi-tenant isolation with @tenlyr/sdk.
 *
 * Routes:
 *   GET  /health          — public (no tenant key needed)
 *   GET  /api/me          — protected: returns tenant identity
 *   GET  /api/usage       — protected: returns this tenant's usage metrics
 *   POST /api/action      — protected: tracks an API call event
 *   GET  /admin/tenants   — admin: lists all tenants (admin key only)
 *
 * Isolation proof:
 *   Every /api/* route requires X-Tenant-API-Key.
 *   Two tenants with different keys get back different data.
 *   There is no way to read another tenant's data.
 */

import "dotenv/config";
import http, { IncomingMessage, ServerResponse } from "http";
import { tenlyr } from "../client";
import { enforceTenancy, trackUsage, TenantRequest } from "../middleware/tenancy";

const PORT = Number(process.env.PORT ?? 3000);

// ── Route handlers ─────────────────────────────────────────────────────────

function healthCheck(_req: IncomingMessage, res: ServerResponse) {
  json(res, 200, { status: "ok", service: "multi-tenant-starter", ts: new Date() });
}

// Protected: returns who you are
const meHandler = enforceTenancy(async (req: TenantRequest, res: ServerResponse) => {
  const tenant = await tenlyr.tenants.get(req.tenantId!);
  await trackUsage(req.tenantApiKey!, "/api/me");
  json(res, 200, {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      plan: tenant.plan,
      status: tenant.status,
      isolationLevel: tenant.isolationLevel,
      region: tenant.region,
    },
    _isolation: "Each key returns only its own tenant. Cross-tenant access is impossible.",
  });
});

// Protected: returns this tenant's usage — completely isolated
const usageHandler = enforceTenancy(async (req: TenantRequest, res: ServerResponse) => {
  const metrics = await tenlyr.usage.metrics(req.tenantApiKey!);
  await trackUsage(req.tenantApiKey!, "/api/usage");
  json(res, 200, {
    usage: metrics,
    _note: "These numbers are scoped 100% to your tenant. Other tenants see their own.",
  });
});

// Protected: simulates doing something billable
const actionHandler = enforceTenancy(async (req: TenantRequest, res: ServerResponse) => {
  const event = await tenlyr.usage.track({
    tenantKey: req.tenantApiKey!,
    metric: "api_call",
    value: 1,
    endpoint: "/api/action",
  });
  json(res, 200, {
    message: "Action recorded",
    event: { id: event.id, metric: event.metric, value: event.value },
  });
});

// Admin: lists all tenants — requires admin key, not a tenant key
async function adminTenantsHandler(req: IncomingMessage, res: ServerResponse) {
  const adminKey = req.headers["x-admin-key"];
  if (adminKey !== process.env.TENLYR_ADMIN_KEY) {
    return json(res, 403, { error: "Admin key required. Set X-Admin-Key header." });
  }
  const { data } = await tenlyr.tenants.list();
  json(res, 200, {
    count: data.length,
    tenants: data.map((t) => ({
      id: t.id,
      name: t.name,
      plan: t.plan,
      status: t.status,
      isolationLevel: t.isolationLevel,
    })),
  });
}

// ── Router ─────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url ?? "/", `http://localhost`).pathname;

    if (req.method === "GET"  && path === "/health")         return healthCheck(req, res);
    if (req.method === "GET"  && path === "/api/me")         return meHandler(req, res);
    if (req.method === "GET"  && path === "/api/usage")      return usageHandler(req, res);
    if (req.method === "POST" && path === "/api/action")     return actionHandler(req, res);
    if (req.method === "GET"  && path === "/admin/tenants")  return adminTenantsHandler(req, res);

    json(res, 404, { error: "Not found" });
  } catch (err: any) {
    console.error("[server error]", err.message);
    json(res, 500, { error: "Internal error", message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n🟢  multi-tenant-starter running on http://localhost:${PORT}`);
  console.log(`\nRoutes:`);
  console.log(`   GET  /health           public`);
  console.log(`   GET  /api/me           requires X-Tenant-API-Key`);
  console.log(`   GET  /api/usage        requires X-Tenant-API-Key`);
  console.log(`   POST /api/action       requires X-Tenant-API-Key`);
  console.log(`   GET  /admin/tenants    requires X-Admin-Key\n`);
});

// ── Helpers ────────────────────────────────────────────────────────────────

function json(res: ServerResponse, code: number, body: object) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body, null, 2));
}
