// 共享的模型调用模块：chat 与课程作业批改共用
// 在 .env 配置 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL 即可接入任意 OpenAI 兼容服务

export const LLM_API_KEY = process.env.LLM_API_KEY ?? "";
export const LLM_BASE_URL = process.env.LLM_BASE_URL ?? "https://api.moonshot.cn/v1";
export const LLM_MODEL = process.env.LLM_MODEL ?? "kimi-k2-0905-preview";

export async function callLLM(systemPrompt: string, history: { role: string; content: string }[]) {
  const resp = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...history],
      temperature: 0.6,
      max_tokens: 2000,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LLM request failed (${resp.status}): ${text}`);
  }
  const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM returned empty content");
  return content;
}
