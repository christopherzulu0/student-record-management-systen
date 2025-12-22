import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
    // Experimental:{
    //   appDir: true,
    // },
  },
  // Include Prisma client files in output file tracing for deployment
  outputFileTracingIncludes: {
    '/api/**/*': ['./app/generated/prisma/**/*'],
    '/*': ['./app/generated/prisma/**/*'],
  },
  
};

export default nextConfig;
