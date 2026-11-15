// OpenNext config for Cloudflare Workers (https://opennext.js.org/cloudflare).
// The app has no ISR / revalidation / "use cache", so no R2 bucket is needed: prerendered pages
// are served read-only from Workers Static Assets, and everything else renders on demand.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
