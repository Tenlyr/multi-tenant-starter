/**
 * Fake in-memory database.
 *
 * The isolation guarantee lives here — not in the route handlers.
 * Every tenant gets its own isolated bucket; there is no way to
 * accidentally leak data across tenants through this API.
 */

type Store = Record<string, string[]>;

const store: Store = {};

function bucket(tenant: string): string[] {
  if (!store[tenant]) {
    store[tenant] = [];
  }
  return store[tenant];
}

export function getData(tenant: string): string[] {
  return [...bucket(tenant)]; // return a copy — no external mutation
}

export function insertData(tenant: string, value: string): void {
  bucket(tenant).push(value);
}
