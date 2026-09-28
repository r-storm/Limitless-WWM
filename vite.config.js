import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/LimitlessGuild/',
  plugins: [react(), tailwindcss()],
  // Polling needed when running under WSL against /mnt/c (no native file events)
  server: { watch: { usePolling: true } },
})
