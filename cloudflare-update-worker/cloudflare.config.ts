import { defineConfig } from "cloudflare";

export default defineConfig({
  name: "sku-tool-update",
  main: "src/index.ts",
  compatibilityDate: "2026-11-05",
  observability: {
    enabled: true,
    traces: { enabled: true },
  },
  vars: {
    GITHUB_OWNER: "Martin-G23",
    GITHUB_REPO: "sku-tool-update",
  },
});
