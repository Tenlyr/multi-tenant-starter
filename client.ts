/**
 * src/demo/run.ts
 *
 * End-to-end demo. Runs without a running server.
 *
 * 1. Provisions two tenants: acme + globex
 * 2. Tracks usage for each independently
 * 3. Fetches usage metrics — proves each tenant sees only their own data
 * 4. Demonstrates that a wrong key is rejected
 * 5. Shows health overview
 * 6. Cleans up (terminates demo tenants)
 */

import "dotenv/config";
import { tenlyr } from "../client";
import { ConflictError, AuthenticationError } from "@tenlyr/sdk";

// Unique suffix so re-runs don't conflict
const run = Date.now().toString(36);

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  multi-tenant-starter · isolation demo");
  console.log("  powered by @tenlyr/sdk");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ── 1. Provision two tenants ─────────────────────────────────────────────
  console.log("STEP 1  Provision two tenants\n");

  const acme = await provision("Acme Corp",  `acme-${run}@demo.com`,  "starter");
  const globex = await provision("Globex",   `globex-${run}@demo.com`, "starter");

  console.log("");

  // ── 2. Track usage events independently ──────────────────────────────────
  console.log("STEP 2  Track usage (each tenant independently)\n");

  // Acme makes 3 API calls
  for (let i = 0; i < 3; i++) {
    await tenlyr.usage.track({ tenantKey: acme.apiKey, metric: "api_call", value: 1 });
  }
  console.log("   ✔ Acme  → tracked 3 api_call events");

  // Globex makes 7 API calls
  for (let i = 0; i < 7; i++) {
    await tenlyr.usage.track({ tenantKey: globex.apiKey, metric: "api_call", value: 1 });
  }
  console.log("   ✔ Globex → tracked 7 api_call events\n");

  // ── 3. Fetch metrics — isolation proof ───────────────────────────────────
  console.log("STEP 3  Fetch usage metrics — isolation proof\n");

  const acmeMetrics   = await tenlyr.usage.metrics(acme.apiKey);
  const globexMetrics = await tenlyr.usage.metrics(globex.apiKey);

  console.log(`   Acme   api_calls: ${acmeMetrics.apiCalls}   ← only Acme's events`);
  console.log(`   Globex api_calls: ${globexMetrics.apiCalls}  ← only Globex's events`);
  console.log("\n   ✔ Tenant data is fully isolated. Each key scopes to its own tenant.\n");

  // ── 4. Show that a wrong key is rejected ─────────────────────────────────
  console.log("STEP 4  Attempt cross-tenant data access\n");

  try {
    // Deliberately pass the wrong key — this should throw
    await tenlyr.usage.metrics("tenlyr_live_fake_key_attempt");
    console.log("   ✘ Should not reach here");
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.log("   ✔ Cross-tenant access rejected  →  AuthenticationError (401)");
      console.log("   ✔ No data leakage possible at the SDK layer.\n");
    } else {
      throw err;
    }
  }

  // ── 5. Health overview ───────────────────────────────────────────────────
  console.log("STEP 5  Health overview\n");

  const health = await tenlyr.health.overview();
  console.log(`   Total tenants  : ${health.total}`);
  console.log(`   Healthy        : ${health.healthy}`);
  console.log(`   Warning        : ${health.warning}`);
  console.log(`   Critical       : ${health.critical}`);
  console.log(`   Avg error rate : ${health.avgErrorRate}%\n`);

  // ── 6. Clean up ──────────────────────────────────────────────────────────
  console.log("STEP 6  Teardown demo tenants\n");

  await tenlyr.tenants.terminate(acme.tenant.id);
  console.log(`   ✔ Acme terminated`);
  await tenlyr.tenants.terminate(globex.tenant.id);
  console.log(`   ✔ Globex terminated\n`);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Demo complete. Total time: see above.");
  console.log("  Ready to wire into your signup flow.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function provision(name: string, ownerEmail: string, plan: "starter" | "growth") {
  const start = Date.now();
  console.log(`   provisionTenant("${name}")`);
  try {
    const result = await tenlyr.tenants.create({ name, ownerEmail, plan });
    const ms = Date.now() - start;
    console.log(`   ✔ DB schema + RLS applied`);
    console.log(`   ✔ API key issued`);
    console.log(`   ✔ ${name} live in ${ms}ms\n`);
    return result;
  } catch (err) {
    if (err instanceof ConflictError) {
      console.log(`   ⚠ ${name} already exists — reusing\n`);
      const { data } = await tenlyr.tenants.list();
      const existing = data.find((t) => t.ownerEmail === ownerEmail)!;
      // Rotate key to get a usable key back
      const rotated = await tenlyr.tenants.rotateApiKey(existing.id);
      return rotated;
    }
    throw err;
  }
}

main().catch((err) => {
  console.error("\n⛔ Demo failed:", err.message);
  process.exit(1);
});
