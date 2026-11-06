import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

const SITE_CSP = [
  "default-src 'self'",
  // Next.js writes small inline scripts for hydration; the static shell cannot carry a per-request nonce.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  `connect-src 'self'${dev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const COMMON = [
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...COMMON, { key: "Content-Security-Policy", value: SITE_CSP }, { key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
  // The old GoDaddy pages now live on the homepage.
  async redirects() {
    return [
      { source: "/meet-our-team", destination: "/#barbers", statusCode: 301 },
      { source: "/gallery", destination: "/#gallery", statusCode: 301 },
      { source: "/contact-us-1", destination: "/#visit", statusCode: 301 },
    ];
  },
};

export default nextConfig;
