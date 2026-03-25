{
  "name": "multi-tenant-starter",
  "version": "1.0.0",
  "description": "Ship your SaaS. Not infrastructure. A production-ready multi-tenant starter using @tenlyr/sdk.",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/demo/server.ts",
    "build": "tsc",
    "start": "node dist/demo/server.js",
    "demo": "tsx src/demo/run.ts",
    "provision": "tsx scripts/provision.ts"
  },
  "dependencies": {
    "@tenlyr/sdk": "latest"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "keywords": [
    "multi-tenant",
    "saas",
    "tenlyr",
    "tenant-isolation",
    "b2b"
  ],
  "license": "MIT"
}
