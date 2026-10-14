import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.API_URL || env.VITE_API_URL || process.env.API_URL || process.env.VITE_API_URL || '';

  return {
    base: './',
    envPrefix: ['VITE_', 'API_'],
    define: {
      'process.env.API_URL': JSON.stringify(apiUrl),
      'import.meta.env.API_URL': JSON.stringify(apiUrl),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
    },
  };
});
