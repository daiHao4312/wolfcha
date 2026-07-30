import { NextRequest, NextResponse } from "next/server";

// 测试请求超时时间（毫秒）
const TEST_TIMEOUT_MS = 15_000;

// 解析 chat completions URL：去除尾部斜杠，若未以 /chat/completions 结尾则自动拼接
function resolveChatCompletionsUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) return "";
  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  if (withoutTrailingSlash.endsWith("/chat/completions")) {
    return withoutTrailingSlash;
  }
  return `${withoutTrailingSlash}/chat/completions`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, baseUrl, model } = body as {
      apiKey?: string;
      baseUrl?: string;
      model?: string;
    };

    const trimmedApiKey = (apiKey ?? "").trim();
    const trimmedBaseUrl = (baseUrl ?? "").trim();
    const trimmedModel = (model ?? "").trim();

    if (!trimmedApiKey) {
      return NextResponse.json({ valid: false, error: "缺少 apiKey" }, { status: 400 });
    }
    if (!trimmedModel) {
      return NextResponse.json({ valid: false, error: "缺少 model" }, { status: 400 });
    }
    if (!trimmedBaseUrl) {
      return NextResponse.json({ valid: false, error: "缺少 baseUrl" }, { status: 400 });
    }

    const chatCompletionsUrl = resolveChatCompletionsUrl(trimmedBaseUrl);
    if (!chatCompletionsUrl) {
      return NextResponse.json({ valid: false, error: "无效的 Base URL" }, { status: 400 });
    }

    // 构造极简测试请求
    const requestBody = {
      model: trimmedModel,
      messages: [{ role: "user", content: "hi" }],
      max_tokens: 1,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TEST_TIMEOUT_MS);

    try {
      const response = await fetch(chatCompletionsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${trimmedApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return NextResponse.json({ valid: true });
      }

      // 解析错误响应体
      const errorText = await response.text().catch(() => "");
      let errorMessage = "";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson?.error?.message || errorJson?.message || "";
      } catch {
        errorMessage = errorText;
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ valid: false, error: "API Key 无效或已过期" });
      }
      if (response.status === 402) {
        return NextResponse.json({ valid: false, error: "API Key 余额不足" });
      }

      return NextResponse.json({
        valid: false,
        error: `测试失败: ${response.status} - ${errorMessage || errorText}`,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json({
          valid: false,
          error: "请求超时，请检查网络连接或 Base URL 是否正确",
        });
      }
      return NextResponse.json({ valid: false, error: `网络错误: ${String(error)}` });
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: String(error ?? "Unknown error") },
      { status: 500 }
    );
  }
}
