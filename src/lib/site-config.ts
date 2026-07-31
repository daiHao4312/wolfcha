/**
 * 站点配置 - 集中管理站点 URL,避免硬编码
 *
 * 服务端:运行时从环境变量 SITE_URL 读取(docker run -e SITE_URL=...)
 * 客户端:通过 getClientSiteUrl() 从浏览器地址栏获取
 */

// 站点完整 URL(带协议),运行时环境变量,无需构建时注入
export const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

// 站点域名(不带协议),用于展示场景如分享海报
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

// OG 图片完整 URL
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Logo 完整 URL
export const SITE_LOGO = `${SITE_URL}/logo.png`;

// Google Analytics ID(可选,不设置则不加载 GA)
export const GA_ID = process.env.GA_ID || "";

// 客户端运行时获取站点 URL(从浏览器地址栏,避免依赖构建时环境变量)
export function getClientSiteUrl(): string {
  return typeof window !== "undefined" ? window.location.origin : SITE_URL;
}

// 客户端运行时获取站点域名
export function getClientSiteDomain(): string {
  return typeof window !== "undefined" ? window.location.hostname : SITE_DOMAIN;
}
