"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomCharacter, CustomCharacterInput } from "@/types/custom-character";
import {
  DEFAULT_CUSTOM_CHARACTER_AGE,
  DEFAULT_CUSTOM_CHARACTER_GENDER,
  MAX_CUSTOM_CHARACTERS,
} from "@/types/custom-character";
import { fillCustomCharacterOptionalFields } from "@/lib/custom-character-defaults";

/** localStorage 存储键 */
const STORAGE_KEY = "wolfcha_custom_characters";

/** 从 localStorage 读取自定义角色列表 */
function readCharactersFromStorage(): CustomCharacter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomCharacter[]) : [];
  } catch {
    return [];
  }
}

/** 将自定义角色列表写入 localStorage */
function writeCharactersToStorage(items: CustomCharacter[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/** 按 created_at 降序排序 */
function sortByCreatedAtDesc(items: CustomCharacter[]): CustomCharacter[] {
  return [...items].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function useCustomCharacters() {
  const [characters, setCharacters] = useState<CustomCharacter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = sortByCreatedAtDesc(readCharactersFromStorage());
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch characters");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCharacter = useCallback(
    async (input: CustomCharacterInput): Promise<CustomCharacter | null> => {
      if (characters.length >= MAX_CUSTOM_CHARACTERS) {
        setError(`Maximum ${MAX_CUSTOM_CHARACTERS} custom characters allowed`);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const normalizedInput = fillCustomCharacterOptionalFields(input);
        const now = new Date().toISOString();
        const avatarSeed = input.avatar_seed || `${input.display_name}-${Date.now()}`;

        // 构造新角色，使用 crypto.randomUUID 生成唯一 ID
        const newChar: CustomCharacter = {
          id: crypto.randomUUID(),
          display_name: normalizedInput.display_name.trim(),
          gender: normalizedInput.gender,
          age: normalizedInput.age,
          mbti: normalizedInput.mbti.toUpperCase(),
          basic_info: normalizedInput.basic_info?.trim() || undefined,
          style_label: normalizedInput.style_label?.trim() || undefined,
          avatar_seed: avatarSeed,
          is_deleted: false,
          created_at: now,
          updated_at: now,
        };

        // 写入 localStorage 并更新状态（新角色置顶）
        const next = [newChar, ...readCharactersFromStorage()];
        writeCharactersToStorage(next);
        setCharacters(sortByCreatedAtDesc(next));
        return newChar;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create character");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [characters.length],
  );

  const updateCharacter = useCallback(
    async (
      id: string,
      input: Partial<CustomCharacterInput>,
    ): Promise<CustomCharacter | null> => {
      setLoading(true);
      setError(null);

      try {
        const items = readCharactersFromStorage();
        const idx = items.findIndex((c) => c.id === id);
        if (idx === -1) {
          setError("Character not found");
          return null;
        }

        const existing = items[idx];

        // 当 mbti/basic_info/style_label 任一存在时，需要规范化可选字段
        const shouldNormalizeOptionalFields =
          input.mbti !== undefined ||
          input.basic_info !== undefined ||
          input.style_label !== undefined;
        const normalizedInput = shouldNormalizeOptionalFields
          ? fillCustomCharacterOptionalFields({
              display_name: input.display_name ?? existing.display_name,
              gender:
                (input.gender as CustomCharacterInput["gender"]) ??
                DEFAULT_CUSTOM_CHARACTER_GENDER,
              age: input.age ?? DEFAULT_CUSTOM_CHARACTER_AGE,
              mbti: input.mbti ?? existing.mbti,
              basic_info: input.basic_info ?? existing.basic_info ?? "",
              style_label: input.style_label ?? existing.style_label ?? "",
              avatar_seed: input.avatar_seed ?? existing.avatar_seed,
            })
          : null;

        // 合并更新字段
        const updated: CustomCharacter = {
          ...existing,
          updated_at: new Date().toISOString(),
        };

        if (input.display_name !== undefined) updated.display_name = input.display_name.trim();
        if (input.gender !== undefined) updated.gender = input.gender;
        if (input.age !== undefined) updated.age = input.age;
        if (input.mbti !== undefined)
          updated.mbti = (normalizedInput?.mbti ?? input.mbti).toUpperCase();
        if (input.basic_info !== undefined)
          updated.basic_info = normalizedInput?.basic_info?.trim() || undefined;
        if (input.style_label !== undefined)
          updated.style_label = normalizedInput?.style_label?.trim() || undefined;
        if (input.avatar_seed !== undefined) updated.avatar_seed = input.avatar_seed;

        items[idx] = updated;
        writeCharactersToStorage(items);
        setCharacters((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update character");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteCharacter = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // 硬删除：从数组中直接移除
      const items = readCharactersFromStorage().filter((c) => c.id !== id);
      writeCharactersToStorage(items);
      setCharacters(items);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete character");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    canAddMore: characters.length < MAX_CUSTOM_CHARACTERS,
    remainingSlots: MAX_CUSTOM_CHARACTERS - characters.length,
  };
}
