import path from "path";
import type { NextConfig } from "next";

// Read version from package.json at build time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version?: string };

const nextConfig: NextConfig = {
  // Note: Removed 'output: "standalone"' - not needed for Vercel deployment
  // standalone mode is for Docker/self-hosted environments and makes deploy much larger
  reactCompiler: true,
  async rewrites() {
    return [
      { source: "/zh", destination: "/" },
      { source: "/zh/", destination: "/" },
      { source: "/zh/:path*", destination: "/:path*" },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version ?? "0.0.0",
  },
  webpack(config, { isServer, webpack }) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      jotai: path.resolve(__dirname, "node_modules/jotai"),
      "jotai/vanilla": path.resolve(__dirname, "node_modules/jotai/vanilla"),
      // DiceBear 头像仅用 toDataUriSync 生成 SVG，无需 PNG/JPEG 转换。
      // converter 依赖原生 .node 二进制，webpack 无法打包，故置空。
      "@dicebear/converter": false,
    };
    // 客户端不会调用 DiceBear 的 .toFile()（其 Node 分支会动态 import node:fs/promises）。
    // 浏览器端无法处理 node: scheme，先去掉前缀再将其解析为空模块。
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        "fs/promises": false,
        fs: false,
      };
    }
    config.module.rules.push({
      test: /\.mp3$/,
      type: "asset/resource",
      generator: {
        filename: "static/media/[name].[hash][ext]",
      },
    });
    return config;
  },
};

export default nextConfig;
