import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['source/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['source/**/*.{ts,tsx}'],
      exclude: [
        'source/**/*.test.{ts,tsx}',
        'source/**/*.type.ts',
        'source/index.ts',
        'source/html/**',
        'source/styles/**',
      ],
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        statements: 80,
        branches: 85,
        functions: 85,
        lines: 80,
      },
    },
  },
});
