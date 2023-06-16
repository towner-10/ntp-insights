/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
const { env } = await import("./src/env.mjs");
import NextBundleAnalyzer from "@next/bundle-analyzer";
import fs from "fs";

// Get version from package.json using fs
const packageJson = fs.readFileSync("./package.json");
const version = JSON.parse(packageJson).version || 0;

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import("next").NextConfig} */
const config = withBundleAnalyzer({
  reactStrictMode: true,
  publicRuntimeConfig: {
    version
  },
  async rewrites() {
    return [
      {
        source: '/google_maps/:path*',
        destination: 'https://maps.googleapis.com/:path*',
      },
      {
        source: '/pbs.twimg.com/:path*',
        destination: 'https://pbs.twimg.com/:path*',
      },
      {
        source: '/backend/:path*',
        destination: `${env.BACKEND_URL}/:path*`,
      }
    ]
  },

  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
   * out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
});
export default config;
