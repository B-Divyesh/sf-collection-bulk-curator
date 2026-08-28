import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts']
  },
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: true
  },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' }
});
