"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { thinkingEnabledAtom } from "@/store/settings";
import {
  getDashscopeApiKey,
  setDashscopeApiKey,
  getDashscopeBaseUrl,
  setDashscopeBaseUrl,
  getZenmuxApiKey,
  setZenmuxApiKey,
  getZenmuxBaseUrl,
  setZenmuxBaseUrl,
  getTokendanceApiKey,
  setTokendanceApiKey,
  getTokendanceBaseUrl,
  setTokendanceBaseUrl,
  getMinimaxApiKey,
  setMinimaxApiKey,
  getMinimaxGroupId,
  setMinimaxGroupId,
  getGeneratorModel,
  setGeneratorModel,
  getSummaryModel,
  setSummaryModel,
  getReviewModel,
  setReviewModel,
  getSelectedModels,
  setSelectedModels,
  getLlmProvider,
  setLlmProvider,
  detectProviderFromUrl,
  getLlmTested,
  setLlmTested,
  type LlmProvider,
} from "@/lib/api-keys";

type TestState = "idle" | "testing" | "ok" | "fail";

/** 受控输入：失焦时提交，避免每次按键都写存储 */
function Field({
  label,
  placeholder,
  value,
  onCommit,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onCommit: (v: string) => void;
  type?: string;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="space-y-1">
      {label && <div className="text-xs font-medium text-[var(--text-secondary)]">{label}</div>}
      <Input
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => onCommit(draft.trim())}
      />
    </div>
  );
}

/**
 * 模型配置区：按用途分为「语言模型」和「语音模型」两部分。
 * 语言模型含 API Key、Base URL、模型名、深度思考开关与测试按钮。
 * 语音模型含 API Key 与 Group ID。
 * 提交时根据 Base URL 自动推断 provider，统一存储。
 */
export function ModelConfigSection() {
  const t = useTranslations();
  const [thinkingEnabled, setThinkingEnabled] = useAtom(thinkingEnabledAtom);

  // 语言模型配置
  const [llmKey, setLlmKey] = useState("");
  const [llmBaseUrl, setLlmBaseUrl] = useState("");
  const [llmModel, setLlmModel] = useState("");
  const [testState, setTestState] = useState<TestState>("idle");
  const [testError, setTestError] = useState("");

  // 初始化测试状态：如果之前已通过测试则显示为 ok
  useEffect(() => {
    if (getLlmTested()) setTestState("ok");
  }, []);

  // 语音模型配置
  const [ttsKey, setTtsKey] = useState("");
  const [ttsGroupId, setTtsGroupId] = useState("");

  // 初始化：从存储读取已配置的语言模型（根据 provider 标识取对应存储）
  useEffect(() => {
    const provider = getLlmProvider() as LlmProvider | "";
    if (provider === "dashscope") {
      setLlmKey(getDashscopeApiKey());
      setLlmBaseUrl(getDashscopeBaseUrl());
    } else if (provider === "zenmux") {
      setLlmKey(getZenmuxApiKey());
      setLlmBaseUrl(getZenmuxBaseUrl());
    } else if (provider === "tokendance") {
      setLlmKey(getTokendanceApiKey());
      setLlmBaseUrl(getTokendanceBaseUrl());
    } else {
      // 未存储 provider 时，查找任一已配置的 key 并加载对应 baseUrl
      const dashKey = getDashscopeApiKey();
      if (dashKey) { setLlmKey(dashKey); setLlmBaseUrl(getDashscopeBaseUrl()); }
      else {
        const zenKey = getZenmuxApiKey();
        if (zenKey) { setLlmKey(zenKey); setLlmBaseUrl(getZenmuxBaseUrl()); }
        else { setLlmKey(getTokendanceApiKey()); setLlmBaseUrl(getTokendanceBaseUrl()); }
      }
    }
    setLlmModel(getGeneratorModel() || getSummaryModel() || getReviewModel() || "");
    setTtsKey(getMinimaxApiKey());
    setTtsGroupId(getMinimaxGroupId());
  }, []);

  /** 提交语言模型配置：推断 provider，清旧存新，统一设置模型名。配置变更时重置测试状态。 */
  const commitLlm = useCallback((key: string, baseUrl: string, model: string) => {
    // 配置变更，重置测试状态
    setLlmTested(false);
    setTestState("idle");

    // 空 key 时只存模型名，不清空已配置的 key/url
    if (!key.trim()) {
      if (model) {
        setGeneratorModel(model);
        setSummaryModel(model);
        setReviewModel(model);
        setSelectedModels([model]);
      }
      return;
    }

    const provider = detectProviderFromUrl(baseUrl);

    // 清除其他 provider 的残留 key，避免后端误匹配
    if (provider !== "dashscope") { setDashscopeApiKey(""); setDashscopeBaseUrl(""); }
    if (provider !== "zenmux") { setZenmuxApiKey(""); setZenmuxBaseUrl(""); }
    if (provider !== "tokendance") { setTokendanceApiKey(""); setTokendanceBaseUrl(""); }

    // 写入当前 provider
    if (provider === "dashscope") { setDashscopeApiKey(key); setDashscopeBaseUrl(baseUrl); }
    if (provider === "zenmux") { setZenmuxApiKey(key); setZenmuxBaseUrl(baseUrl); }
    if (provider === "tokendance") { setTokendanceApiKey(key); setTokendanceBaseUrl(baseUrl); }

    setLlmProvider(provider);

    // 模型名统一写入四个角色
    if (model) {
      setGeneratorModel(model);
      setSummaryModel(model);
      setReviewModel(model);
      setSelectedModels([model]);
    }
  }, []);

  // 各字段失焦提交
  const commitKey = useCallback((v: string) => {
    setLlmKey(v);
    commitLlm(v, llmBaseUrl, llmModel);
  }, [llmBaseUrl, llmModel, commitLlm]);

  const commitBaseUrl = useCallback((v: string) => {
    setLlmBaseUrl(v);
    commitLlm(llmKey, v, llmModel);
  }, [llmKey, llmModel, commitLlm]);

  const commitModel = useCallback((v: string) => {
    setLlmModel(v);
    commitLlm(llmKey, llmBaseUrl, v);
  }, [llmKey, llmBaseUrl, commitLlm]);

  /** 测试语言模型可用性 */
  const handleTest = useCallback(async () => {
    if (!llmKey.trim() || !llmBaseUrl.trim() || !llmModel.trim()) return;
    setTestState("testing");
    setTestError("");
    try {
      const res = await fetch("/api/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: llmKey.trim(),
          baseUrl: llmBaseUrl.trim(),
          model: llmModel.trim(),
        }),
      });
      const data = await res.json();
      setTestState(data.valid ? "ok" : "fail");
      setTestError(data.valid ? "" : (data.error || t("settings.models.testFail")));
      setLlmTested(!!data.valid);
    } catch {
      setTestState("fail");
      setTestError(t("settings.models.testFail"));
    }
  }, [llmKey, llmBaseUrl, llmModel, t]);

  return (
    <div className="space-y-4">
      {/* ── 语言模型 ── */}
      <div className="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-3">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)]">{t("settings.models.llm.title")}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{t("settings.models.llm.compatible")}</div>
        </div>

        <Field
          label={t("settings.models.llm.apiKey")}
          placeholder="sk-xxxxxxxxxxxx"
          value={llmKey}
          onCommit={commitKey}
          type="password"
        />
        <Field
          label={t("settings.models.llm.baseUrl")}
          placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
          value={llmBaseUrl}
          onCommit={commitBaseUrl}
        />
        <Field
          label={t("settings.models.llm.model")}
          placeholder="qwen3.7-flash"
          value={llmModel}
          onCommit={commitModel}
        />

        {/* 深度思考开关 + 测试按钮 */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <Switch checked={thinkingEnabled} onCheckedChange={setThinkingEnabled} />
            <div>
              <div className="text-xs font-medium text-[var(--text-primary)]">{t("settings.thinking.title")}</div>
              <div className="text-xs text-[var(--text-muted)]">{t("settings.thinking.description")}</div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={testState === "testing" || !llmKey.trim() || !llmBaseUrl.trim() || !llmModel.trim()}
            onClick={handleTest}
          >
            {testState === "testing" ? t("settings.models.testing") : t("settings.models.test")}
          </Button>
        </div>

        {/* 测试结果 */}
        {testState === "ok" && (
          <div className="text-xs text-green-500">{t("settings.models.testOk")}</div>
        )}
        {testState === "fail" && (
          <div className="text-xs text-red-500 break-all">{testError || t("settings.models.testFail")}</div>
        )}
      </div>

      {/* ── 语音模型 ── */}
      <div className="rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-card)] p-3 space-y-3">
        <div className="text-sm font-medium text-[var(--text-primary)]">{t("settings.models.tts.title")}</div>
        <Field
          label={t("settings.models.tts.apiKey")}
          placeholder="xxxxxxxx"
          value={ttsKey}
          onCommit={(v) => { setMinimaxApiKey(v); setTtsKey(v); }}
          type="password"
        />
        <Field
          label={t("settings.models.tts.groupId")}
          placeholder="xxxxxxxx"
          value={ttsGroupId}
          onCommit={(v) => { setMinimaxGroupId(v); setTtsGroupId(v); }}
        />
      </div>
    </div>
  );
}
