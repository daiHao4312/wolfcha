import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// 运行时读取环境变量,确保每次请求都能拿到最新的 SITE_URL
export const dynamic = "force-dynamic";

// 动态 robots.txt - 通过 SITE_URL 环境变量配置域名(docker run -e SITE_URL=...)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
