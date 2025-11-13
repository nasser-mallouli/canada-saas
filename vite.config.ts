import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Allow external connections
    port: 5173,
    // Allow ngrok, Cloudflare Tunnel, and other tunnel domains
    allowedHosts: [
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app',
      '.trycloudflare.com', // Cloudflare Tunnel
      '.loca.lt', // Localtunnel
      'localhost',
      '127.0.0.1',
    ],
    // Or allow all hosts when exposing publicly (less secure but needed for testing)
    // Uncomment the line below if you still have issues:
    // strictPort: false,
  },
});
