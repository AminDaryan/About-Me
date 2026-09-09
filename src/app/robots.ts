import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* robots.txt is a crawling directive, never an access control: anything listed
   here is still fetchable by anyone who types the URL. Nothing on this site is
   private, so everything is allowed and the file exists only to point crawlers
   at the sitemap. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
