/**
 * Provision script — the "wow moment".
 *
 * Run:  npm run provision
 *
 * Creates a demo tenant via the Tenlyr SDK and seeds it with sample data
 * so the API demo works immediately after.
 */

import 'dotenv/config';
import { tenlyr } from '../src/client';
import { insertData } from '../src/lib/db';

const DEMO_TENANTS = ['acme', 'globex'];

async function provision(): Promise<void> {
  console.log('\n⚙️   Provisioning demo tenants...\n');

  const start = Date.now();

  for (const slug of DEMO_TENANTS) {
    const tenant = await tenlyr.createTenant(slug);

    // Seed a couple of rows so the GET demo is immediately interesting
    insertData(tenant.slug, `${slug} — first record`);
    insertData(tenant.slug, `${slug} — second record`);

    console.log(`  ✅  Tenant "${tenant.slug}" ready  (id: ${tenant.id})`);
  }

  const elapsed = Date.now() - start;

  console.log(`\n🎉  Done in ${elapsed}ms`);
  console.log('\n   Now start the server:');
  console.log('   npm run dev\n');
}

provision().catch((err) => {
  console.error('❌  Provision failed:', err);
  process.exit(1);
});
