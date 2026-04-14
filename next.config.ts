import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 父層 repo 另有 lockfile 時，明確指定 App 根目錄（見 turbopack.root 文件）
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
