import { Router, Request, Response } from 'express';
import { getData, insertData } from '../lib/db';
import { resolveTenant } from '../middleware/tenancy';

const router = Router({ mergeParams: true });

// Apply tenancy middleware to every route in this router
router.use(resolveTenant);

/**
 * GET /tenant/:tenantId/data
 *
 * Returns data for the resolved tenant.
 * Notice: there is NO tenant filter here — isolation is handled by db.ts.
 */
router.get('/', (req: Request, res: Response) => {
  const items = getData(req.tenant);

  res.json({
    tenant: req.tenant,
    count: items.length,
    items,
  });
});

/**
 * POST /tenant/:tenantId/data
 * Body: { "value": "some string" }
 *
 * Inserts a value for the resolved tenant.
 * Again: no tenant filter — the db layer handles it.
 */
router.post('/', (req: Request, res: Response) => {
  const { value } = req.body as { value?: string };

  if (!value || typeof value !== 'string') {
    res.status(400).json({ error: 'Body must include a non-empty "value" string.' });
    return;
  }

  insertData(req.tenant, value);

  res.status(201).json({
    tenant: req.tenant,
    inserted: value,
    total: getData(req.tenant).length,
  });
});

export default router;
