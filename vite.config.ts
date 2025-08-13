import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: (() => {
    const keyPath = 'localhost-key.pem';
    const certPath = 'localhost.pem';

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        https: {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        },
        host: 'localhost',
        port: 5173,
      };
    }

    // Fallback to HTTP if cert files are missing
    return {
      https: false,
      host: 'localhost',
      port: 5173,
    };
  })(),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
