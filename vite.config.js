/// <reference types="vitest" />
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [
        react(),
        viteStaticCopy({
          targets: [
            {
              src: 'api',
              dest: ''
            },
            {
              src: '.htaccess',
              dest: ''
            }
          ]
        })
      ],
      
      server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
      },
      
      resolve: {
        alias: {
          '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), '.'),
        }
      },
    };
});
