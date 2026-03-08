import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Proxy API requests to the FastAPI backend during development so that
   * the browser never hits a CORS wall.  In production this would be
   * handled by a reverse-proxy (nginx, Caddy, etc.).
   */
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  /* ------------------------------------------------------------------ */
  /*  Production optimisations                                          */
  /* ------------------------------------------------------------------ */

  /** Generate gzip-compressed assets alongside standard ones. */
  compress: true,

  /** React strict mode for catching subtle bugs. */
  reactStrictMode: true,

  /** Tree-shake server-only code from the client bundle. */
  serverExternalPackages: [],
};

export default nextConfig;
