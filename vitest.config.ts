import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['lib/utils/__tests__/**/*.test.ts', 'actions/__tests__/**/*.test.ts'],
    globals: true,
    reporters: ['default'],
  },
});
