/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    localPatterns: [{ pathname: '/**' }],
  },
};

export default nextConfig;
