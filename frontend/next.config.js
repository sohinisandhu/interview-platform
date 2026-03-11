/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "interview-platform-fsa6.onrender.com" }] },
};
module.exports = nextConfig;
