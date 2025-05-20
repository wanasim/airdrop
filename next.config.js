/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
  // Optimize package imports
  optimizePackageImports: ["@tabler/icons-react", "@radix-ui/react-label", "@radix-ui/react-slot"],
};

module.exports = nextConfig;
