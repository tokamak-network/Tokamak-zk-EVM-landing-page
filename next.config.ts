import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tokamak-zk-evm/synthesizer-web", "tokamak-l2js"],
};

export default nextConfig;
