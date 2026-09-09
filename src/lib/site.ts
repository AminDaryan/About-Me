/**
 * The site's canonical origin.
 *
 * Everything that has to be an absolute URL derives from this: metadataBase,
 * the canonical link on every page, the sitemap, and robots.txt. Getting it
 * wrong does not break the build — it silently emits canonicals and Open Graph
 * URLs pointing at the wrong host, which is worse.
 *
 * The default is the live origin, so a plain `yarn build` is correct without
 * any environment configuration. NEXT_PUBLIC_SITE_URL overrides it for a
 * preview deployment or a rename; it is read at build time, not at request
 * time, so a change needs a redeploy.
 *
 * No trailing slash — every consumer here appends its own path.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://amindariani.com"
).replace(/\/+$/, "");

/** Every indexable route, in navigation order. Feeds the sitemap. */
export const ROUTES = ["/", "/research", "/cv", "/beyond"] as const;
