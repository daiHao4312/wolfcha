"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FingerprintSimple, Sparkle, Wrench, GearSix, GithubLogo, Star, DotsThreeOutlineVertical, Users, UsersFour } from "@phosphor-icons/react";
import { WerewolfIcon } from "@/components/icons/FlatIcons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import type { DevPreset, DifficultyLevel, Role, StartGameOptions } from "@/types/game";
import { DevModeButton } from "@/components/DevTools";
import { GameSetupModal } from "@/components/game/GameSetupModal";
import { LocaleSwitcher } from "@/components/game/LocaleSwitcher";
import { CustomCharacterModal } from "@/components/game/CustomCharacterModal";
import { useCustomCharacters } from "@/hooks/useCustomCharacters";
import { difficultyAtom, playerCountAtom, preferredRoleAtom } from "@/store/settings";
import { useAppLocale } from "@/i18n/useAppLocale";

const CUSTOM_CHARACTER_SELECTION_STORAGE_KEY = "wolfcha_custom_character_selection";

function buildDefaultRoles(playerCount: number): Role[] {
  switch (playerCount) {
    case 8:
      return ["Werewolf", "Werewolf", "Werewolf", "Seer", "Witch", "Hunter", "Villager", "Villager"];
    case 9:
      return [
        "Werewolf",
        "Werewolf",
        "Werewolf",
        "Seer",
        "Witch",
        "Hunter",
        "Villager",
        "Villager",
        "Villager",
      ];
    case 11:
      return [
        "Werewolf",
        "Werewolf",
        "Werewolf",
        "WhiteWolfKing",
        "Seer",
        "Witch",
        "Hunter",
        "Guard",
        "Idiot",
        "Villager",
        "Villager",
      ];
    case 12:
      return [
        "Werewolf",
        "Werewolf",
        "Werewolf",
        "WhiteWolfKing",
        "Seer",
        "Witch",
        "Hunter",
        "Guard",
        "Idiot",
        "Villager",
        "Villager",
        "Villager",
      ];
    case 10:
    default:
      return [
        "Werewolf",
        "Werewolf",
        "WhiteWolfKing",
        "Seer",
        "Witch",
        "Hunter",
        "Guard",
        "Villager",
        "Villager",
        "Villager",
      ];
  }
}

function getRoleCountConfig(playerCount: number) {
  const werewolfCount = playerCount >= 11 ? 3 : 2;
  const whiteWolfKingCount = 1;
  const wolfCount = werewolfCount + whiteWolfKingCount;
  const guardCount = playerCount >= 10 ? 1 : 0;
  const idiotCount = playerCount >= 11 ? 1 : 0;
  const seerCount = 1;
  const witchCount = 1;
  const hunterCount = 1;
  const godCount = seerCount + witchCount + hunterCount + guardCount + idiotCount;
  const villagerCount = Math.max(0, playerCount - wolfCount - godCount);
  return {
    werewolfCount,
    whiteWolfKingCount,
    wolfCount,
    guardCount,
    seerCount,
    witchCount,
    hunterCount,
    idiotCount,
    villagerCount,
  };
}

interface WelcomeScreenProps {
  humanName: string;
  setHumanName: (name: string) => void;
  onStart: (options?: StartGameOptions) => void | Promise<void>;
  onAbort?: () => void;
  isLoading: boolean;
  isGenshinMode: boolean;
  onGenshinModeChange: (value: boolean) => void;
  isSpectatorMode: boolean;
  onSpectatorModeChange: (value: boolean) => void;
  bgmVolume: number;
  isSoundEnabled: boolean;
  isAiVoiceEnabled: boolean;
  isAutoAdvanceDialogueEnabled: boolean;
  onBgmVolumeChange: (value: number) => void;
  onSoundEnabledChange: (value: boolean) => void;
  onAiVoiceEnabledChange: (value: boolean) => void;
  onAutoAdvanceDialogueEnabledChange: (value: boolean) => void;
}

export function WelcomeScreen({
  humanName,
  setHumanName,
  onStart,
  onAbort,
  isLoading,
  isGenshinMode,
  onGenshinModeChange,
  isSpectatorMode,
  onSpectatorModeChange,
  bgmVolume,
  isSoundEnabled,
  isAiVoiceEnabled,
  isAutoAdvanceDialogueEnabled,
  onBgmVolumeChange,
  onSoundEnabledChange,
  onAiVoiceEnabledChange,
  onAutoAdvanceDialogueEnabledChange,
}: WelcomeScreenProps) {
  const t = useTranslations();
  const { locale } = useAppLocale();
  const discordInviteUrl = "https://discord.gg/ETkdZWgy";

  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const sealButtonRef = useRef<HTMLButtonElement | null>(null);
  const isStartingRef = useRef(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupImgOk, setGroupImgOk] = useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCustomCharacterOpen, setIsCustomCharacterOpen] = useState(false);

  // 自定义角色选择存储键（固定值，不再依赖用户）
  const selectionStorageKey = CUSTOM_CHARACTER_SELECTION_STORAGE_KEY;

  const readSelectionFromStorage = useCallback(() => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const raw = window.localStorage.getItem(selectionStorageKey);
      if (!raw) return new Set<string>();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set<string>();
      return new Set(parsed.filter((item): item is string => typeof item === "string"));
    } catch {
      return new Set<string>();
    }
  }, [selectionStorageKey]);

  const selectionStorageKeyRef = useRef<string | null>(null);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(() =>
    readSelectionFromStorage()
  );

  const customCharacters = useCustomCharacters();
  const [difficulty, setDifficulty] = useAtom(difficultyAtom);
  const [playerCount, setPlayerCount] = useAtom(playerCountAtom);
  const [preferredRole, setPreferredRole] = useAtom(preferredRoleAtom);
  const [githubStars, setGithubStars] = useState<number | null>(null);

  useEffect(() => {
    if (locale === "en") setIsGroupOpen(false);
  }, [locale]);

  useEffect(() => {
    selectionStorageKeyRef.current = selectionStorageKey;
    setSelectedCharacterIds(readSelectionFromStorage());
  }, [readSelectionFromStorage, selectionStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectionStorageKeyRef.current !== selectionStorageKey) return;
    const ids = Array.from(selectedCharacterIds);
    window.localStorage.setItem(selectionStorageKey, JSON.stringify(ids));
  }, [selectedCharacterIds, selectionStorageKey]);

  // 过滤掉已删除的自定义角色
  useEffect(() => {
    if (customCharacters.loading) return;
    const validIds = new Set(customCharacters.characters.map((char) => char.id));
    const filtered = new Set(
      Array.from(selectedCharacterIds).filter((id) => validIds.has(id))
    );
    if (filtered.size !== selectedCharacterIds.size) {
      setSelectedCharacterIds(filtered);
    }
  }, [customCharacters.characters, customCharacters.loading, selectedCharacterIds]);

  // 调试面板状态
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [devTab, setDevTab] = useState<"preset" | "roles">("preset");
  const [devPreset, setDevPreset] = useState<DevPreset | "">("");
  const showDevTools =
    process.env.NODE_ENV !== "production" && (process.env.NEXT_PUBLIC_SHOW_DEVTOOLS ?? "true") === "true";

  const roleOptions: Role[] = ["Villager", "Werewolf", "WhiteWolfKing", "Seer", "Witch", "Hunter", "Guard", "Idiot"];
  const roleLabels = useMemo<Record<Role, string>>(
    () => ({
      Villager: t("roles.villager"),
      Werewolf: t("roles.werewolf"),
      WhiteWolfKing: t("roles.whiteWolfKing"),
      Seer: t("roles.seer"),
      Witch: t("roles.witch"),
      Hunter: t("roles.hunter"),
      Guard: t("roles.guard"),
      Idiot: t("roles.idiot"),
    }),
    [t]
  );

  const [devRoleOverrideEnabled, setDevRoleOverrideEnabled] = useState(false);
  const [fixedRoles, setFixedRoles] = useState<(Role | "")[]>(() => buildDefaultRoles(10));

  useEffect(() => {
    setFixedRoles(buildDefaultRoles(playerCount));
  }, [playerCount]);

  // 获取 GitHub star 数
  useEffect(() => {
    fetch('https://api.github.com/repos/oil-oil/wolfcha')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count !== undefined) {
          setGithubStars(data.stargazers_count);
        }
      })
      .catch(() => {
        // 静默失败，stars 保持 null
      });
  }, []);

  const roleConfigValid = useMemo(() => {
    if (fixedRoles.length !== playerCount) return false;
    if (fixedRoles.some((r) => !r)) return false;

    const counts: Record<Role, number> = {
      Villager: 0,
      Werewolf: 0,
      Seer: 0,
      Witch: 0,
      Hunter: 0,
      Guard: 0,
      Idiot: 0,
      WhiteWolfKing: 0,
    };
    for (const r of fixedRoles) {
      counts[r as Role] += 1;
    }

    const expected = getRoleCountConfig(playerCount);
    return (
      counts.Werewolf === expected.werewolfCount &&
      counts.WhiteWolfKing === expected.whiteWolfKingCount &&
      counts.Seer === expected.seerCount &&
      counts.Witch === expected.witchCount &&
      counts.Hunter === expected.hunterCount &&
      counts.Guard === expected.guardCount &&
      counts.Idiot === expected.idiotCount &&
      counts.Villager === expected.villagerCount
    );
  }, [fixedRoles, playerCount]);

  const roleConfigHint = useMemo(() => {
    const expected = getRoleCountConfig(playerCount);
    const godLabel =
      expected.guardCount > 0 ? t("welcome.roleConfig.godLabelFull") : t("welcome.roleConfig.godLabelNoGuard");
    return t("welcome.roleConfig.hint", {
      wolfCount: expected.wolfCount,
      godLabel,
      villagerCount: expected.villagerCount,
    });
  }, [playerCount, t]);

  const canConfirm = useMemo(() => {
    return !!humanName.trim() && !isLoading && !isTransitioning;
  }, [humanName, isLoading, isTransitioning]);

  const isAnyModalOpen =
    isSetupOpen ||
    isGroupOpen ||
    isMobileMenuOpen ||
    isCustomCharacterOpen ||
    isDevConsoleOpen;

  // 羊皮纸鼠标倾斜效果
  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;

    if (typeof window === "undefined") return;
    if ("ontouchstart" in window) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const update = () => {
      rafId = null;
      const xAxis = (window.innerWidth / 2 - lastX) / 60;
      const yAxis = (window.innerHeight / 2 - lastY) / 60;
      paper.style.setProperty("--wc-tilt-x", `${xAxis}`);
      paper.style.setProperty("--wc-tilt-y", `${yAxis}`);
    };

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    };

    const onLeave = () => {
      paper.style.setProperty("--wc-tilt-x", "0");
      paper.style.setProperty("--wc-tilt-y", "0");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // 蜡封点击粒子效果
  const createParticles = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 18; i += 1) {
      const particle = document.createElement("div");
      particle.className = "wc-particle";
      document.body.appendChild(particle);

      const size = Math.random() * 7 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 90 + 40;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 90;

      particle.animate(
        [
          { transform: "translate(0, 0) scale(1)", opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 },
        ],
        {
          duration: 900 + Math.random() * 450,
          easing: "cubic-bezier(0, .9, .57, 1)",
          fill: "forwards",
        }
      );

      window.setTimeout(() => particle.remove(), 1600);
    }
  };

  // 构建开始游戏的配置选项
  const buildStartOptions = (): StartGameOptions => {
    const roles = devTab === "roles" && devRoleOverrideEnabled && roleConfigValid ? (fixedRoles as Role[]) : undefined;
    const preset = devTab === "preset" && devPreset ? (devPreset as DevPreset) : undefined;
    const selectedCustomChars = customCharacters.characters
      .filter(c => selectedCharacterIds.has(c.id))
      .map(c => ({
        id: c.id,
        display_name: c.display_name,
        gender: c.gender,
        age: c.age,
        mbti: c.mbti,
        basic_info: c.basic_info,
        style_label: c.style_label,
        avatar_seed: c.avatar_seed,
      }));

    return {
      fixedRoles: roles,
      devPreset: preset,
      difficulty,
      playerCount,
      customCharacters: selectedCustomChars,
      preferredRole: preferredRole || undefined,
    };
  };

  // 等待开始动画完成
  const waitForStartAnimation = async (startedAt: number) => {
    const remaining = Math.max(0, 800 - (Date.now() - startedAt));
    if (remaining <= 0) return;
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, remaining);
    });
  };

  // 开始游戏（简化后不再有积分消费逻辑）
  const startGame = async () => {
    if (isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;
    const animationStartedAt = Date.now();

    const seal = sealButtonRef.current;
    if (seal) createParticles(seal);

    setIsTransitioning(true);

    try {
      await waitForStartAnimation(animationStartedAt);
      await onStart(buildStartOptions());
    } catch (error) {
      console.error("[welcome] failed to start game", error);
      setIsTransitioning(false);
      onAbort?.();
    } finally {
      isStartingRef.current = false;
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm) {
      return;
    }
    if (isStartingRef.current) {
      return;
    }
    await startGame();
  };

  const handleOpenGroup = () => {
    if (locale === "en") {
      if (typeof window !== "undefined") {
        window.open(discordInviteUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    setIsGroupOpen(true);
  };

  const groupIcon =
    locale === "en" ? (
      <img
        src="/Discord-Symbol-Blurple.svg"
        alt="Discord"
        className="h-4 w-4"
      />
    ) : (
      <Users size={16} />
    );

  return (
    <>
      <div className="wc-contract-screen selection:bg-[var(--color-accent)] selection:text-white">
        <div className="wc-contract-fog" aria-hidden="true" />
        <div className="wc-contract-vignette" aria-hidden="true" />

        <GameSetupModal
          open={isSetupOpen}
          onOpenChange={setIsSetupOpen}
          playerCount={playerCount}
          onPlayerCountChange={setPlayerCount}
          preferredRole={preferredRole}
          onPreferredRoleChange={setPreferredRole}
          isGenshinMode={isGenshinMode}
          onGenshinModeChange={onGenshinModeChange}
          isSpectatorMode={isSpectatorMode}
          onSpectatorModeChange={onSpectatorModeChange}
          bgmVolume={bgmVolume}
          isSoundEnabled={isSoundEnabled}
          isAiVoiceEnabled={isAiVoiceEnabled}
          isAutoAdvanceDialogueEnabled={isAutoAdvanceDialogueEnabled}
          onBgmVolumeChange={onBgmVolumeChange}
          onSoundEnabledChange={onSoundEnabledChange}
          onAiVoiceEnabledChange={onAiVoiceEnabledChange}
          onAutoAdvanceDialogueEnabledChange={onAutoAdvanceDialogueEnabledChange}
        />
        <CustomCharacterModal
          open={isCustomCharacterOpen}
          onOpenChange={setIsCustomCharacterOpen}
          characters={customCharacters.characters}
          loading={customCharacters.loading}
          canAddMore={customCharacters.canAddMore}
          remainingSlots={customCharacters.remainingSlots}
          selectedIds={selectedCharacterIds}
          onSelectionChange={setSelectedCharacterIds}
          onCreateCharacter={customCharacters.createCharacter}
          onUpdateCharacter={customCharacters.updateCharacter}
          onDeleteCharacter={customCharacters.deleteCharacter}
        />

        <Dialog
          open={locale === "en" ? false : isGroupOpen}
          onOpenChange={(open) => {
            if (locale === "en") return;
            setIsGroupOpen(open);
          }}
        >
          <DialogContent className="max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users size={18} weight="duotone" />
                {t("welcome.group.title")}
              </DialogTitle>
              <DialogDescription>{t("welcome.group.description")}</DialogDescription>
            </DialogHeader>

            <div className="mt-2 flex items-center justify-center">
              {groupImgOk !== false && (
                <img
                  src="/group.png"
                  alt={t("settings.about.group.alt")}
                  className="w-full max-w-[280px] max-h-[50vh] rounded-md border-2 border-[var(--border-color)] bg-white object-contain"
                  onLoad={() => setGroupImgOk(true)}
                  onError={() => setGroupImgOk(false)}
                />
              )}
              {groupImgOk === false && (
                <div className="text-xs text-[var(--text-muted)]">{t("settings.about.group.missing")}</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DialogContent className="max-w-[420px]">
            <DialogHeader>
              <DialogTitle>{t("welcome.mobileMenu.title")}</DialogTitle>
              <DialogDescription>{t("welcome.mobileMenu.description")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSetupOpen(true);
                }}
              >
                <GearSix size={16} />
                {t("welcome.settings")}
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a
                  href="https://github.com/oil-oil/wolfcha"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <GithubLogo size={16} />
                  {t("welcome.github.title")}
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="wc-welcome-actions absolute top-5 right-5 z-20 flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <LocaleSwitcher className="shrink-0" />
            <a
              href="https://github.com/oil-oil/wolfcha"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-md border-2 border-[var(--border-color)] bg-[var(--bg-card)] px-2 py-1 text-[11px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all group"
              title="View on GitHub"
            >
              <GithubLogo size={15} className="group-hover:scale-110 transition-transform" />
              <span className="hidden lg:inline">GitHub</span>
              <span className="flex items-center gap-1 text-[var(--color-gold)]">
                <Star size={12} weight="fill" className="group-hover:scale-110 transition-transform" />
                <span className="font-serif text-xs font-bold tabular-nums tracking-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  {githubStars !== null ? githubStars.toLocaleString() : '···'}
                </span>
              </span>
            </a>
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenGroup}
              className="h-8 text-xs gap-2"
            >
              {groupIcon}
              {t("welcome.group.title")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSetupOpen(true)}
              className="h-8 text-xs gap-2"
            >
              <GearSix size={16} />
              {t("welcome.settings")}
            </Button>
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <LocaleSwitcher className="shrink-0" />
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenGroup}
              className="h-8 text-xs gap-2"
            >
              {groupIcon}
              {t("welcome.group.short")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-8 w-8 px-0"
              aria-label={t("welcome.mobileMenu.more")}
            >
              <DotsThreeOutlineVertical size={18} />
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative z-10 w-full max-w-[460px] px-6"
        >
          <div ref={paperRef} className="wc-contract-paper">
            <div className="wc-contract-borders" aria-hidden="true" />

            <div className="mt-2 text-center">
              <div className="wc-contract-title">WOLFCHA</div>
              <div className="wc-contract-subtitle">{t("welcome.subtitle")}</div>
            </div>

            <div className="mt-7 text-center wc-contract-body">
              <div className="wc-contract-oath">
                {t("welcome.oath.line1")}
                <br />
                {t("welcome.oath.line2")}
                <br />
                {t("welcome.oath.line3")}
              </div>

              <div className="mt-4">
                <div className="wc-contract-label">{t("welcome.signature.label")}</div>
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={mounted ? humanName : ""}
                    onChange={(e) => setHumanName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      if (e.nativeEvent.isComposing) return;
                      if (isAnyModalOpen) return;
                      e.preventDefault();
                      void handleConfirm();
                    }}
                    placeholder={t("welcome.signature.placeholder")}
                    className="wc-signature-input"
                    autoComplete="off"
                    autoFocus
                    disabled={isLoading || isTransitioning}
                  />
                  <AnimatePresence>
                    {mounted && !!humanName.trim() && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="wc-signature-ok"
                      >
                        <Sparkle weight="fill" size={18} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* 自定义角色入口 */}
            <button
              type="button"
              onClick={() => setIsCustomCharacterOpen(true)}
              className="mt-6 mx-auto flex items-center gap-2 px-3 py-1.5 rounded-md border-2 border-dashed border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              <UsersFour size={14} />
              <span>{t("customCharacter.entryButton")}</span>
              {selectedCharacterIds.size > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-medium">
                  {selectedCharacterIds.size}
                </span>
              )}
              {customCharacters.characters.length > 0 && selectedCharacterIds.size === 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--text-muted)]/20 text-[var(--text-muted)] text-[10px] font-medium">
                  {customCharacters.characters.length}
                </span>
              )}
            </button>

            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="wc-seal-hint">
                {mounted && canConfirm ? t("welcome.sealHint.ready") : t("welcome.sealHint.waiting")}
              </div>
              <button
                ref={sealButtonRef}
                type="button"
                className="wc-wax-seal"
                onClick={handleConfirm}
                disabled={mounted && !canConfirm}
              >
                <FingerprintSimple weight="fill" size={44} className="wc-wax-seal-icon" />
              </button>
            </div>

            <div className="wc-corner-mark" aria-hidden="true">
              <WerewolfIcon size={30} className="text-[var(--color-wolf)] opacity-30" />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {isTransitioning && (
            <motion.div
              className="wc-transition-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="wc-transition-text"
                initial={{ opacity: 0, y: 10, scale: 1.05, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.18, duration: 0.55, ease: "easeOut" }}
              >
                <div className="wc-transition-title">{t("welcome.transition.title")}</div>
                <div className="wc-transition-subtitle">{t("welcome.transition.subtitle")}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showDevTools && (
        <>
          <DevModeButton
            onClick={() => {
              setIsDevModeEnabled(true);
              setIsDevConsoleOpen(true);
            }}
          />

          <AnimatePresence>
            {isDevConsoleOpen && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="wc-dev-console fixed right-0 top-0 bottom-0 w-[400px] z-[120] bg-gray-900/95 backdrop-blur-md border-l border-gray-700 shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <Wrench size={20} className="text-yellow-400" />
                    <span className="font-bold text-white">{t("welcome.dev.title")}</span>
                  </div>
                  <button
                    onClick={() => setIsDevConsoleOpen(false)}
                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                    type="button"
                  >
                    <span className="text-xl leading-none">×</span>
                  </button>
                </div>

                <div className="flex border-b border-gray-700">
                  <button
                    type="button"
                    onClick={() => setDevTab("preset")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${devTab === "preset"
                        ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                      }`}
                  >
                    {t("welcome.dev.tabs.preset")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevTab("roles")}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${devTab === "roles"
                        ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                      }`}
                  >
                    {t("welcome.dev.tabs.roles")}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {devTab === "preset" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-300">{t("welcome.dev.preset.title")}</div>
                        <button
                          type="button"
                          onClick={() => setDevPreset("")}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          {t("welcome.dev.preset.clear")}
                        </button>
                      </div>
                      <select
                        value={devPreset}
                        onChange={(e) => setDevPreset(e.target.value as DevPreset | "")}
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-400"
                      >
                        <option value="">{t("welcome.dev.preset.none")}</option>
                        <option value="MILK_POISON_TEST">{t("welcome.dev.preset.milkPoison")}</option>
                        <option value="LAST_WORDS_TEST">{t("welcome.dev.preset.lastWords")}</option>
                      </select>
                    </div>
                  )}

                  {devTab === "roles" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-gray-300">
                          {t("welcome.dev.roles.title", { count: playerCount })}
                        </div>
                        <div className={`text-xs ${roleConfigValid ? "text-green-400" : "text-gray-400"}`}>
                          {roleConfigValid ? t("welcome.dev.roles.ready") : roleConfigHint}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                        <span className="text-xs text-gray-300">{t("welcome.dev.roles.overrideLabel")}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={devRoleOverrideEnabled}
                          onClick={() => setDevRoleOverrideEnabled(prev => !prev)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            devRoleOverrideEnabled ? "bg-yellow-500" : "bg-gray-600"
                          }`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                            devRoleOverrideEnabled ? "translate-x-[18px]" : "translate-x-[3px]"
                          }`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {fixedRoles.map((role, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-10 text-xs text-gray-400">
                              {t("welcome.dev.roles.seat", { seat: idx + 1 })}
                            </span>
                            <select
                              value={role}
                              onChange={(e) => {
                                const next = [...fixedRoles];
                                next[idx] = e.target.value as Role;
                                setFixedRoles(next);
                              }}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-400"
                            >
                              {roleOptions.map((r) => (
                                <option key={r} value={r}>
                                  {roleLabels[r]}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
