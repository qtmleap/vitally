import { readFileSync } from "node:fs";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function prismaSourcemapFix(): Plugin {
  return {
    name: "prisma-sourcemap-fix",
    enforce: "pre",
    load(id) {
      if (id.includes("/generated/prisma/") && id.endsWith(".js")) {
        const code = readFileSync(id, "utf-8");
        return { code: code.replace(/\/\/# sourceMappingURL=.*$/m, ""), map: null };
      }
    },
  };
}

const buildVersion = Date.now().toString(36);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
  plugins: [
    prismaSourcemapFix(),
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
      persistState: true,
      remoteBindings: false,
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
