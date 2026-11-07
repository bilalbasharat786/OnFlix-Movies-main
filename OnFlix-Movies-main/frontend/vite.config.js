import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy'; // 🔥 Naya Plugin Import Kiya

export default defineConfig({
  plugins: [
    react(),
    // 🔥 Legacy Config Add Ki
    legacy({
      targets: ['defaults', 'not IE 11', 'Android >= 4.4', 'Chrome >= 49'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
});
