import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // Node 18+ has Web Crypto globally — no Cloudflare runtime needed
    include: ['tests/**/*.test.ts'],
  },
});
