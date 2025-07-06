/// <reference types="vitest" />
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode: _mode }) => { // mode renamed to _mode
    // const env = loadEnv(_mode, '.', ''); // If loadEnv were used, it'd use _mode
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
