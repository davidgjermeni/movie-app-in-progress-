import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
              style-src 'self' 'unsafe-inline';
              frame-src https://challenges.cloudflare.com;
              connect-src 'self' https://challenges.cloudflare.com;
            `.replace(/\s+/g, " ").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;