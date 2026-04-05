import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import vinext from 'vinext'
import { type Plugin, defineConfig } from 'vite'

const isDev = process.env.NODE_ENV !== 'production'

function cloudflareWorkersShim(): Plugin {
  return {
    name: 'cloudflare-workers-shim',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'cloudflare:workers') return '\0cloudflare:workers'
    },
    load(id) {
      if (id === '\0cloudflare:workers') return 'export const env = {};'
    }
  }
}

export default defineConfig({
  plugins: [
    ...(isDev ? [cloudflareWorkersShim()] : []),
    vinext(),
    ...(!isDev
      ? [
          cloudflare({
            viteEnvironment: {
              name: 'rsc',
              childEnvironments: ['ssr']
            }
          })
        ]
      : []),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  },
  build: {
    rollupOptions: {
      external: ['cloudflare:workers']
    }
  }
})
