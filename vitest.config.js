import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    testURL: 'http://localhost:3000',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.config.{js,ts}',
        'dist/',
        'api/',
        'src/assets/',
        '**/*.css'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Performance testing configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/test/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'api/',
      '.{idea,git,cache,output,temp}/',
      '{tmp,temp}/',
      '**/*.config.{js,ts}'
    ],
    // Watch configuration
    watchExclude: [
      'node_modules/',
      'dist/',
      'api/',
      'memory-bank/'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@test': path.resolve(__dirname, './src/test')
    }
  }
});
