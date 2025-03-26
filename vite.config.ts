import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_TITLE': JSON.stringify('REST Server'),
  },
  plugins: [vue()],
  base: './',
  build: {
    outDir: "/../../../../../SoftwareAG/AdabasRestAdministration/static",
    sourcemap: true,
  emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
