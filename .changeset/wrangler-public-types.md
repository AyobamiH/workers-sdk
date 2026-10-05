---
"wrangler": patch
---

Fix Wrangler's published declaration bundle for strict TypeScript consumers

Wrangler now resolves private build-time type dependencies into its public declaration bundle. Projects using `skipLibCheck: false` can import public Wrangler types such as `GetPlatformProxyOptions` without requiring Wrangler's private dev dependencies.
