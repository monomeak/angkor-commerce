import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  allowedDevOrigins: ["192.168.20.209"],
};

export default nextConfig;
