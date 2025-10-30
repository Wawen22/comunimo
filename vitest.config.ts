import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default;

  return {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: 'jsdom',
      include: [
        'lib/utils/__tests__/**/*.test.ts',
        'actions/__tests__/**/*.test.ts',
        'components/**/__tests__/**/*.test.ts',
        'components/**/__tests__/**/*.test.tsx',
      ],
      globals: true,
      reporters: ['default'],
      setupFiles: ['./vitest.setup.ts'],
    },
  };
});
