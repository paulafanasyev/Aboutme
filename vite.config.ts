import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages is hosted under /Aboutme/, while Vercel serves this project at domain root.
  base: process.env.VERCEL === '1' ? '/' : '/Aboutme/',
  plugins: [react()],
})
