# Root Cause Analysis

## Selected root causes

- **C — NAS source path typo/encoding mismatch.** The encoded rule contains `%E0%B8%9B` (`ป`) where `%E0%B8%9A` (`บ`) is required. Production encoded requests return 404.
- **E — Static artifact takes precedence when the GoPro encoded request has no matching redirect.** The production build log proves that the static GoPro route exists, and production returns that HTML with 200.
- **H — Missing encoded GoPro redirect variant in source configuration.** The working lens control has a valid encoded variant; GoPro does not.

## Excluded causes

- A/B: deployment, repository, branch, commit, project, and root all match.
- F: no usable project-level Bulk Redirect layer exists on this plan and no conflicting source route was found.
- G: no cache-only conclusion is supported; the behavior follows the exact source-rule defects and persists on the verified deployment.

## Authorized fix target

Only `vercel.json`: correct the NAS encoded source and add the exact encoded GoPro source beside its literal rule. Destination pages, Astro pages, SEO content, scripts, sitemap logic, canonical, and robots remain unchanged.

