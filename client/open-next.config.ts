import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();
// Explicitly define buildCommand so OpenNext doesn't recursively call "npm run build"
config.buildCommand = "npx next build";

export default config;
