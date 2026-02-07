
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Biztosítja, hogy a process.env elérhető legyen a kliens oldalon is
    'process.env': {}
  }
});
