/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: false
  },
  preview: {
    port: 3000,
    host: '127.0.0.1'
  },
  test: {
    globals: true,
    environment: 'node',
  }
});
