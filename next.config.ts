import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  images: {
    domains: ['images.unsplash.com'],
  },
  
  turbopack: {
    root: '/home/ethan/code/RaAI',
  },
  
  // Exclude backend directory from Next.js processing
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  
  webpack: (config) => {
    // Ignore the backend directory
    config.watchOptions = {
      ignored: ['**/backend/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
