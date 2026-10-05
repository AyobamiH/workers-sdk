---
"wrangler": patch
---

Fix the published Wrangler declaration bundle so TypeScript consumers do not need Wrangler's private build dependencies

Wrangler now rolls private dev-only type dependencies into its public declaration file instead of leaving unresolved imports to packages that are not installed with Wrangler. Projects using `skipLibCheck: false` can import public Wrangler types such as `GetPlatformProxyOptions` without those package-resolution errors.
