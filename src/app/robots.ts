import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

// 动态 robots.txt - 通过 NEXT_PUBLIC_SITE_URL 环境变量配置域名
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
