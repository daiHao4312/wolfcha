const ZENMUX_API_KEY_STORAGE = "wolfcha_zenmux_api_key";
const DASHSCOPE_API_KEY_STORAGE = "wolfcha_dashscope_api_key";
const TOKENDANCE_API_KEY_STORAGE = "wolfcha_tokendance_api_key";
const MINIMAX_API_KEY_STORAGE = "wolfcha_minimax_api_key";
const MINIMAX_GROUP_ID_STORAGE = "wolfcha_minimax_group_id";
const CUSTOM_KEY_ENABLED_STORAGE = "wolfcha_custom_key_enabled";
const SELECTED_MODELS_STORAGE = "wolfcha_selected_models";
const GENERATOR_MODEL_STORAGE = "wolfcha_generator_model";
const SUMMARY_MODEL_STORAGE = "wolfcha_summary_model";
const REVIEW_MODEL_STORAGE = "wolfcha_review_model";
const VALIDATED_ZENMUX_KEY_STORAGE = "wolfcha_validated_zenmux_key";
const VALIDATED_DASHSCOPE_KEY_STORAGE = "wolfcha_validated_dashscope_key";
const VALIDATED_TOKENDANCE_KEY_STORAGE = "wolfcha_validated_tokendance_key";
export const TOKENDANCE_BASE_URL = "https://tokendance.agent-universe.cn/gateway/v1";
export const ZENMUX_BASE_URL_DEFAULT = "https://zenmux.ai/api/v1";
export const DASHSCOPE_BASE_URL_DEFAULT = "https://dashscope.aliyuncs.com/compatible-mode/v1";

// 各 provider Base URL 的持久化键
const ZENMUX_BASE_URL_STORAGE = "wolfcha_zenmux_base_url";
const DASHSCOPE_BASE_URL_STORAGE = "wolfcha_dashscope_base_url";
const TOKENDANCE_BASE_URL_STORAGE = "wolfcha_tokendance_base_url";

// 统一 LLM provider 标识（用于后端路由）
const LLM_PROVIDER_STORAGE = "wolfcha_llm_provider";

// 思考（reasoning / thinking）总开关的持久化键
const THINKING_ENABLED_STORAGE = "wolfcha.settings.thinking_enabled";

export type LlmProvider = "dashscope" | "zenmux" | "tokendance";

/** 根据 Base URL 自动推断 provider 类型 */
export function detectProviderFromUrl(url: string): LlmProvider {
  const lower = url.toLowerCase();
  if (lower.includes("dashscope") || lower.includes("aliyuncs")) return "dashscope";
  if (lower.includes("zenmux")) return "zenmux";
  if (lower.includes("tokendance")) return "tokendance";
  // 默认走 dashscope 分支（标准 OpenAI 兼容）
  return "dashscope";
}

/** 读取当前 LLM provider 标识 */
export function getLlmProvider(): string {
  return readStorage(LLM_PROVIDER_STORAGE) || "";
}

/** 存储 LLM provider 标识 */
export function setLlmProvider(provider: string) {
  writeStorage(LLM_PROVIDER_STORAGE, provider);
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage(key: string): string {
  if (!canUseStorage()) return "";
  const value = window.localStorage.getItem(key);
  return typeof value === "string" ? value.trim() : "";
}

function writeStorage(key: string, value: string) {
  if (!canUseStorage()) return;
  const trimmed = value.trim();
  if (!trimmed) {
    window.localStorage.removeItem(key);
    return;
  }
  window.localStorage.setItem(key, trimmed);
}

export function getZenmuxApiKey(): string {
  return readStorage(ZENMUX_API_KEY_STORAGE);
}

export function setZenmuxApiKey(key: string) {
  writeStorage(ZENMUX_API_KEY_STORAGE, key);
}

export function getMinimaxApiKey(): string {
  return readStorage(MINIMAX_API_KEY_STORAGE);
}

export function getDashscopeApiKey(): string {
  return readStorage(DASHSCOPE_API_KEY_STORAGE);
}

export function getTokendanceApiKey(): string {
  return readStorage(TOKENDANCE_API_KEY_STORAGE);
}

export function getTokendanceBaseUrl(): string {
  return readStorage(TOKENDANCE_BASE_URL_STORAGE) || TOKENDANCE_BASE_URL;
}

export function setTokendanceBaseUrl(url: string) {
  writeStorage(TOKENDANCE_BASE_URL_STORAGE, url);
}

export function getZenmuxBaseUrl(): string {
  return readStorage(ZENMUX_BASE_URL_STORAGE) || ZENMUX_BASE_URL_DEFAULT;
}

export function setZenmuxBaseUrl(url: string) {
  writeStorage(ZENMUX_BASE_URL_STORAGE, url);
}

export function getDashscopeBaseUrl(): string {
  return readStorage(DASHSCOPE_BASE_URL_STORAGE) || DASHSCOPE_BASE_URL_DEFAULT;
}

export function setDashscopeBaseUrl(url: string) {
  writeStorage(DASHSCOPE_BASE_URL_STORAGE, url);
}

export function setMinimaxApiKey(key: string) {
  writeStorage(MINIMAX_API_KEY_STORAGE, key);
}

export function setDashscopeApiKey(key: string) {
  writeStorage(DASHSCOPE_API_KEY_STORAGE, key);
}

export function setTokendanceApiKey(key: string) {
  writeStorage(TOKENDANCE_API_KEY_STORAGE, key);
}

export function getMinimaxGroupId(): string {
  return readStorage(MINIMAX_GROUP_ID_STORAGE);
}

export function setMinimaxGroupId(id: string) {
  writeStorage(MINIMAX_GROUP_ID_STORAGE, id);
}

export function hasZenmuxKey(): boolean {
  return Boolean(getZenmuxApiKey());
}

export function getValidatedZenmuxKey(): string {
  return readStorage(VALIDATED_ZENMUX_KEY_STORAGE);
}

export function setValidatedZenmuxKey(key: string) {
  writeStorage(VALIDATED_ZENMUX_KEY_STORAGE, key);
}

export function getValidatedDashscopeKey(): string {
  return readStorage(VALIDATED_DASHSCOPE_KEY_STORAGE);
}

export function setValidatedDashscopeKey(key: string) {
  writeStorage(VALIDATED_DASHSCOPE_KEY_STORAGE, key);
}

export function getValidatedTokendanceKey(): string {
  return readStorage(VALIDATED_TOKENDANCE_KEY_STORAGE);
}

export function setValidatedTokendanceKey(key: string) {
  writeStorage(VALIDATED_TOKENDANCE_KEY_STORAGE, key);
}

export function getValidatedTokendanceBaseUrl(): string {
  return TOKENDANCE_BASE_URL;
}

export function setValidatedTokendanceBaseUrl() {
  // TokenDance gateway URL is fixed for custom-key gameplay.
}

export function hasDashscopeKey(): boolean {
  return Boolean(getDashscopeApiKey());
}

export function hasTokendanceKey(): boolean {
  return Boolean(getTokendanceApiKey());
}

export function hasMinimaxKey(): boolean {
  return Boolean(getMinimaxApiKey()) && Boolean(getMinimaxGroupId());
}

// When custom key is enabled, keep model within providers that have keys.
export function isCustomKeyEnabled(): boolean {
  // 所有用户必须自带 Key，只要有任意 LLM API key 配置即视为启用
  return hasZenmuxKey() || hasDashscopeKey() || hasTokendanceKey();
}

/** 检查 LLM 是否已配置（Key + 模型名均非空） */
export function isLlmConfigured(): boolean {
  return isCustomKeyEnabled() && !!getGeneratorModel();
}

// LLM 测试结果存储
const LLM_TESTED_STORAGE = "wolfcha_llm_tested";

/** 读取 LLM 测试是否通过 */
export function getLlmTested(): boolean {
  return readStorage(LLM_TESTED_STORAGE) === "true";
}

/** 写入 LLM 测试结果 */
export function setLlmTested(value: boolean) {
  writeStorage(LLM_TESTED_STORAGE, value ? "true" : "false");
}

/** 读取思考总开关（默认关闭，避免拖慢响应与占满 token）。 */
export function getThinkingEnabled(): boolean {
  return readStorage(THINKING_ENABLED_STORAGE) === "true";
}

/** 写入思考总开关。 */
export function setThinkingEnabled(value: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(THINKING_ENABLED_STORAGE, value ? "true" : "false");
}

export function setCustomKeyEnabled(value: boolean) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CUSTOM_KEY_ENABLED_STORAGE, value ? "true" : "false");
  if (!value) {
    window.localStorage.removeItem(SELECTED_MODELS_STORAGE);
    window.localStorage.removeItem(GENERATOR_MODEL_STORAGE);
    window.localStorage.removeItem(SUMMARY_MODEL_STORAGE);
    window.localStorage.removeItem(REVIEW_MODEL_STORAGE);
  }
}

export function getSelectedModels(): string[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(SELECTED_MODELS_STORAGE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => String(item ?? "").trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function setSelectedModels(models: string[]) {
  if (!canUseStorage()) return;
  const normalized = models.map((m) => String(m ?? "").trim()).filter(Boolean);
  if (normalized.length === 0) {
    window.localStorage.removeItem(SELECTED_MODELS_STORAGE);
    return;
  }
  window.localStorage.setItem(SELECTED_MODELS_STORAGE, JSON.stringify(normalized));
}

export function getGeneratorModel(): string {
  return readStorage(GENERATOR_MODEL_STORAGE);
}

export function setGeneratorModel(model: string) {
  writeStorage(GENERATOR_MODEL_STORAGE, model);
}

export function getSummaryModel(): string {
  return readStorage(SUMMARY_MODEL_STORAGE);
}

export function setSummaryModel(model: string) {
  writeStorage(SUMMARY_MODEL_STORAGE, model);
}

export function getReviewModel(): string {
  return readStorage(REVIEW_MODEL_STORAGE);
}

export function setReviewModel(model: string) {
  writeStorage(REVIEW_MODEL_STORAGE, model);
}

export function clearApiKeys() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ZENMUX_API_KEY_STORAGE);
  window.localStorage.removeItem(DASHSCOPE_API_KEY_STORAGE);
  window.localStorage.removeItem(TOKENDANCE_API_KEY_STORAGE);
  window.localStorage.removeItem(MINIMAX_API_KEY_STORAGE);
  window.localStorage.removeItem(MINIMAX_GROUP_ID_STORAGE);
  window.localStorage.removeItem(CUSTOM_KEY_ENABLED_STORAGE);
  window.localStorage.removeItem(SELECTED_MODELS_STORAGE);
  window.localStorage.removeItem(GENERATOR_MODEL_STORAGE);
  window.localStorage.removeItem(SUMMARY_MODEL_STORAGE);
  window.localStorage.removeItem(REVIEW_MODEL_STORAGE);
  window.localStorage.removeItem(VALIDATED_ZENMUX_KEY_STORAGE);
  window.localStorage.removeItem(VALIDATED_DASHSCOPE_KEY_STORAGE);
  window.localStorage.removeItem(VALIDATED_TOKENDANCE_KEY_STORAGE);
  window.localStorage.removeItem(ZENMUX_BASE_URL_STORAGE);
  window.localStorage.removeItem(DASHSCOPE_BASE_URL_STORAGE);
  window.localStorage.removeItem(TOKENDANCE_BASE_URL_STORAGE);
  window.localStorage.removeItem(LLM_PROVIDER_STORAGE);
  window.localStorage.removeItem(LLM_TESTED_STORAGE);
  window.localStorage.removeItem("wolfcha_validated_tokendance_base_url");
}

export interface KeyValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: string;
}

export async function validateApiKeyBalance(): Promise<KeyValidationResult> {
  // 本地检查：是否有任意 Key 配置（不再调用远程验证接口）
  if (!isCustomKeyEnabled()) {
    return { valid: false, error: "未配置任何 API Key", errorCode: "no_key" };
  }
  return { valid: true };
}
