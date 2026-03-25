import 'dotenv/config';
import express, { Request, Response } from 'express';
import dataRouter from './routes/data';
import { resolveTenant } from './middleware/tenancy';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

// Core: tenant-scoped data API
app.use('/tenant/:tenantId/data', dataRouter);

// Debug: see which tenant is resolved for the current request
app.get('/debug/context', resolveTenant, (req: Request, res: Response) => {
  res.json({
    resolvedTenant: req.tenant,
    tip: 'Pass x-tenant-id header or use /tenant/:tenantId/data',
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`\n   Try it:`);
  console.log(`   curl http://localhost:${PORT}/tenant/acme/data`);
  console.log(`   curl http://localhost:${PORT}/tenant/globex/data\n`);
});

export default app;
