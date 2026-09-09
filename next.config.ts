import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route here prerenders as static HTML, so the whole site is a folder
  // of files. Cloudflare Pages serves ./out directly — no Node runtime, no
  // server-side attack surface, nothing to exploit beyond the static assets.
  output: "export",

  // Consequences of the line above, worth knowing before changing anything:
  //
  //  - headers() and redirects() here do NOTHING in an export. They are applied
  //    by the Next server, which is not running. Security headers live in
  //    public/_headers and redirects in public/_redirects, both read by
  //    Cloudflare Pages. See those files.
  //  - next/image optimisation is unavailable. The one photograph is a plain
  //    <img> in src/components/Portrait.tsx, so nothing depends on it.
  //  - No route may use runtime-only features (cookies, headers, dynamic
  //    params without generateStaticParams). The build fails loudly if one does.

  // Do not ship a JS source map to the browser: it would republish readable
  // component source and comments to anyone who opens devtools. This is the
  // default, set explicitly so it survives a future config edit.
  productionBrowserSourceMaps: false,

  // Strip the framework version header. It tells an attacker which Next
  // release to look up known issues for and does nothing for the visitor.
  poweredByHeader: false,
};

export default nextConfig;
