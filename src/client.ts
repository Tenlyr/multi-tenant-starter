import 'dotenv/config';

const key = process.env.TENLYR_ADMIN_KEY;

if (!key) {
  console.error('❌  Missing TENLYR_ADMIN_KEY in environment.');
  console.error('   Copy .env.example → .env and fill in your key.');
  process.exit(1);
}

/**
 * Tenlyr SDK client.
 *
 * NOTE: Replace this stub with the real @tenlyr/sdk initialiser once you
 * have an account.  The rest of the codebase doesn't care — it only calls
 * the methods below.
 */
export const tenlyr = {
  /**
   * Create (provision) a new tenant by slug.
   * Returns a minimal tenant descriptor.
   */
  async createTenant(slug: string): Promise<{ id: string; slug: string }> {
    // 🔌 real call: await TenlyrSDK({ apiKey: key }).tenants.create({ slug })
    return { id: `tid_${slug}`, slug };
  },
};
