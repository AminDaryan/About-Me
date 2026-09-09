import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

/* Emitted as a static sitemap.xml by `output: "export"`. Four routes and no
   lastModified: a date that is really "whenever the site was last built" is
   noise to a crawler, and an inaccurate one trains it to ignore the field. */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));
}
