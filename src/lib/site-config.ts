/**
 * 站点配置 - 集中管理站点 URL,避免硬编码
 *
 * 通过环境变量 NEXT_PUBLIC_SITE_URL 配置(如 https://example.com)
 * 同时支持服务端和客户端(NEXT_PUBLIC_ 前缀)
 */

// 站点完整 URL(带协议),部署时必须通过 NEXT_PUBLIC_SITE_URL 设置
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// 站点域名(不带协议),用于展示场景如分享海报
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

// OG 图片完整 URL
export const SITE_OG_IMAGE = `${SITE_URL}/og-image.png`;

// Logo 完整 URL
export const SITE_LOGO = `${SITE_URL}/logo.png`;

// Google Analytics ID(可选,不设置则不加载 GA)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
