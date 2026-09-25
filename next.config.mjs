/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    localPatterns: [{ pathname: '/**' }],
    remotePatterns: [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io").hostname }],
  },
};

export default nextConfig;
