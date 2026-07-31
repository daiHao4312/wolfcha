import type { Metadata } from "next";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";
import { LandingContent } from "./LandingContent";
import {
  JsonLd,
  getGameJsonLd,
  getWebsiteJsonLd,
  getFAQJsonLd,
  getHowToJsonLd,
} from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Wolfcha - AI Werewolf Game | AI狼人杀 | Play Werewolf with AI Online",
  description:
    "Play Werewolf with AI opponents online for free. A single-player social deduction game where AI players speak, bluff, suspect, vote, and react like a real table. 免费在线AI狼人杀游戏，一个人也能玩！",
  keywords: [
    "AI werewolf",
    "AI werewolf game",
    "play werewolf alone",
    "single player werewolf",
    "werewolf game online",
    "online werewolf game",
    "werewolf game online free",
    "mafia werewolf game online",
    "AI mafia game",
    "social deduction game",
    "werewolf with AI opponents",
    "werewolf with AI",
    "AI狼人杀",
    "狼人杀游戏",
    "单人狼人杀",
    "在线狼人杀",
    "AI狼人杀游戏",
    "一个人玩狼人杀",
    "免费狼人杀",
    "狼人杀单机",
    "AI对战狼人杀",
    "全AI对手狼人杀",
    "社交推理游戏",
  ],
  alternates: {
    canonical: `${SITE_URL}/landing`,
    languages: {
      "en": `${SITE_URL}/landing`,
      "zh-CN": `${SITE_URL}/landing`,
    },
  },
  openGraph: {
    title: "Wolfcha - AI Werewolf Game | AI狼人杀",
    description:
      "Play Werewolf with AI opponents. Single-player social deduction with AI players that speak, bluff, suspect, and vote. 免费AI狼人杀，一个人也能玩！",
    url: `${SITE_URL}/landing`,
    siteName: "Wolfcha",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Wolfcha - AI Werewolf Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wolfcha - AI Werewolf Game | AI狼人杀",
    description:
      "Play Werewolf with AI opponents. Single-player social deduction game with AI dialogue, bluffing, and voting. 免费AI狼人杀！",
    images: [SITE_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <JsonLd data={getGameJsonLd()} />
      <JsonLd data={getWebsiteJsonLd()} />
      <JsonLd data={getFAQJsonLd()} />
      <JsonLd data={getHowToJsonLd()} />
      <LandingContent />
    </>
  );
}
