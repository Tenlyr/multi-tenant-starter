import { Request, Response, NextFunction } from 'express';

// Augment Express's Request type so TypeScript knows about req.tenant
declare global {
  namespace Express {
    interface Request {
      tenant: string;
    }
  }
}

/**
 * Tenancy middleware.
 *
 * Resolves the active tenant from (in order of priority):
 *   1. URL path param  — /tenant/:tenantId/...
 *   2. Request header  — x-tenant-id: acme
 *
 * Attaches the result to `req.tenant`.
 * Returns 400 if neither source provides a value.
 */
export function resolveTenant(req: Request, res: Response, next: NextFunction): void {
  const tenant =
    (req.params.tenantId as string | undefined) ||
    (req.headers['x-tenant-id'] as string | undefined);

  if (!tenant || tenant.trim() === '') {
    res.status(400).json({
      error: 'Missing tenant. Provide :tenantId in the URL or an x-tenant-id header.',
    });
    return;
  }

  req.tenant = tenant.trim().toLowerCase();
  next();
}
