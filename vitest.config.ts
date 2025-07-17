// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['tests/**/*.ts'],  // Include all .ts test files
    globals: true,               // Optional: use describe/it without import
    environment: 'jsdom',        // For DOM testing
    setupFiles: 'tests/setup.ts', // Global setup file
  }
});
