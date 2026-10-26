import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths: the same build works at mattgwagner.github.io/game-night-showdown/ and locally.
  base: './',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'] },
});
