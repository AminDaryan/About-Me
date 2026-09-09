/**
 * The site's canonical origin.
 *
 * Everything that has to be an absolute URL derives from this: metadataBase,
 * the canonical link on every page, the sitemap, and robots.txt. Getting it
 * wrong does not break the build — it silently emits canonicals and Open Graph
 * URLs pointing at the wrong host, which is worse.
 *
 * Set NEXT_PUBLIC_SITE_URL in the Cloudflare Pages project settings (Settings →
 * Environment variables, Production). It is read at build time, not at request
 * time, so a change needs a redeploy.
 *
 * No trailing slash — every consumer here appends its own path.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.invalid"
).replace(/\/+$/, "");

/** True when SITE_URL is still the placeholder, so callers can behave sensibly. */
export const SITE_URL_IS_PLACEHOLDER = SITE_URL.endsWith("example.invalid");

/** Every indexable route, in navigation order. Feeds the sitemap. */
export const ROUTES = ["/", "/research", "/cv", "/beyond"] as const;
