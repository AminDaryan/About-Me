import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every route here prerenders as static HTML, so the site can also be
  // exported to a plain folder for hosts that do not run Node — GitHub Pages,
  // for instance. Uncomment the line below and run `yarn build`; the finished
  // site appears in ./out.
  //
  // output: "export",
};

export default nextConfig;
