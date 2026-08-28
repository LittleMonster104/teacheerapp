import { useEffect, useRef, useState } from "react";
import { agents, type AgentDef } from "../data";
import { SectionTag } from "../components/chrome";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

type Msg = { role: "user" | "assistant"; text: string };

function ErrorNotice({ code, onNavigate }: { code: string; onNavigate: () => void }) {
  const map: Record<string, { title: string; desc: string }> = {
    PRO_REQUIRED: { title: "学科层智能体为会员专属", desc: "开通会员即可解锁全部学科层智能体，每月 500 次生成额度。" },
    CREDITS_EXHAUSTED: { title: "学分不足", desc: "本月免费额度已用完，可购买积分包或升级会员。" },
    AI_NOT_CONFIGURED: {
      title: "模型服务待配置",
      desc: "平台管理员尚未配置模型密钥（LLM_API_KEY）。可接入任意 OpenAI 兼容服务，如 Moonshot 开放平台或本地 Ollama（需内网穿透为公网地址）。",
    },
  };
  const info = map[code] ?? { title: "服务暂时不可用", desc: code };
  return (
    <div className="border border-vermilion bg-paper-card p-4 text-sm">
      <div className="font-medium text-vermilion mb-1">{info.title}</div>
      <p className="text-ink-soft text-[13px] leading-relaxed mb-3">{info.desc}</p>
      {code !== "AI_NOT_CONFIGURED" && (
        <button onClick={onNavigate} className="text-xs bg-ink text-[#eef1ea] px-4 py-2 hover:bg-vermilion transition-colors">
          去解决 →
        </button>
      )}
    </div>
  );
}

function ChatPanel({ agent, onNavigate }: { agent: AgentDef; onNavigate: (p: "pricing" | "login") => void }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const utils = trpc.useUtils();
  const [input, setInput] = useState("");
  const [localMsgs, setLocalMsgs] = useState<Msg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history } = trpc.chat.history.useQuery(
    { agentId: agent.id },
    { enabled: isAuthenticated }
  );

  const send = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      setLocalMsgs((m) => [...m, { role: "assistant", text: data.reply }]);
      setError(null);
      utils.account.me.invalidate();
      utils.chat.history.invalidate({ agentId: agent.id });
    },
    onError: (e) => {
      setLocalMsgs((m) => m.slice(0, -1)); // 移除占位用户消息
      setError(e.message);
    },
  });

  useEffect(() => {
    setLocalMsgs([]);
    setError(null);
    setInput("");
  }, [agent]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [localMsgs, history, error]);

  const doSend = (text: string) => {
    const msg = text.trim();
    if (!msg || send.isPending) return;
    setError(null);
    setLocalMsgs((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    send.mutate({ agentId: agent.id, message: msg });
  };

  const historyMsgs: Msg[] = (history ?? []).map((m) => ({ role: m.role as "user" | "assistant", text: m.content }));
  const allMsgs: Msg[] = [{ role: "assistant", text: agent.greeting }, ...historyMsgs, ...localMsgs];

  return (
    <div className="ledger-card flex flex-col h-[600px]">
      {/* 头部 */}
      <div className="border-b border-ink px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 flex items-center justify-center font-serif-cn text-sm ${agent.pro ? "bg-vermilion text-white" : "bg-ink text-[#eef1ea]"}`}>
            {agent.name[0]}
          </span>
          <div>
            <div className="font-medium text-sm">{agent.name}</div>
            <div className="text-[11px] text-ink-faint">{agent.tagline}</div>
          </div>
        </div>
        <span className="text-[10px] tracking-widest border border-black/20 px-2 py-0.5 text-ink-faint">
          {agent.pro ? "会员专属 · 对话存档" : "免费 · 对话存档"}
        </span>
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-paper relative">
        {!authLoading && !isAuthenticated && (
          <div className="absolute inset-0 bg-paper/85 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-ink-soft">登录后即可与智能体真实对话，历史自动存档</p>
            <button
              onClick={() => onNavigate("login")}
              className="bg-ink text-[#eef1ea] px-6 py-3 text-sm font-medium hover:bg-vermilion transition-colors"
            >
              使用 Kimi 账号登录
            </button>
          </div>
        )}

        {allMsgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`shrink-0 w-7 h-7 text-[11px] flex items-center justify-center font-serif-cn ${
                m.role === "assistant" ? "bg-vermilion text-white" : "border border-ink"
              }`}
            >
              {m.role === "assistant" ? "AI" : "师"}
            </span>
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "assistant" ? "bg-paper-card border border-ink" : "bg-ink text-[#eef1ea]"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {send.isPending && (
          <div className="flex gap-2.5">
            <span className="shrink-0 w-7 h-7 bg-vermilion text-white text-[11px] flex items-center justify-center font-serif-cn">AI</span>
            <div className="bg-paper-card border border-ink px-3.5 py-2.5 text-sm typing-caret text-ink-soft">
              正在思考
            </div>
          </div>
        )}

        {error && <ErrorNotice code={error} onNavigate={() => onNavigate("pricing")} />}
      </div>

      {/* 输入区 */}
      <div className="border-t border-ink p-4 bg-paper-card">
        <div className="flex gap-2 mb-3 flex-wrap">
          {agent.samples.map((s, i) => (
            <button
              key={i}
              onClick={() => doSend(s.q)}
              disabled={!isAuthenticated || send.isPending}
              className="text-xs border border-black/25 px-2.5 py-1.5 hover:border-ink hover:bg-ink hover:text-[#eef1ea] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s.q.length > 22 ? s.q.slice(0, 22) + "…" : s.q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                doSend(input);
              }
            }}
            placeholder={isAuthenticated ? "描述你的教学场景，Enter 发送…" : "登录后开始对话"}
            disabled={!isAuthenticated || send.isPending}
            rows={2}
            className="flex-1 border border-ink bg-paper px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-vermilion disabled:opacity-50"
          />
          <button
            onClick={() => doSend(input)}
            disabled={!isAuthenticated || send.isPending || !input.trim()}
            className="bg-ink text-[#eef1ea] px-5 text-sm font-medium hover:bg-vermilion transition-colors disabled:opacity-40"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Agents({ onNavigate }: { onNavigate: (p: "pricing" | "login") => void }) {
  const [activeId, setActiveId] = useState("math-diag");
  const active = agents.find((a) => a.id === activeId)!;
  const general = agents.filter((a) => a.layer === "通用层");
  const subject = agents.filter((a) => a.layer === "学科层");

  const AgentItem = ({ a }: { a: AgentDef }) => (
    <button
      onClick={() => setActiveId(a.id)}
      className={`w-full text-left p-4 border transition-colors ${
        activeId === a.id ? "bg-ink text-[#eef1ea] border-ink" : "border-black/20 hover:border-ink bg-paper-card"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{a.name}</span>
        {a.pro && <span className="text-[10px] tracking-widest px-1.5 py-0.5 bg-vermilion text-white">PRO</span>}
      </div>
      <div className={`text-xs ${activeId === a.id ? "text-white/60" : "text-ink-faint"}`}>{a.tagline}</div>
    </button>
  );

  return (
    <div className="pt-28 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <SectionTag no="01" label="智能体工作台" />
        <div className="mb-10">
          <h1 className="font-serif-cn font-bold text-3xl md:text-5xl mb-4">两层智能体<br />一层管效率，一层管深度</h1>
          <p className="text-ink-soft max-w-xl leading-relaxed">
            通用层全部免费，做流量与信任；学科层内置学科教学法模型，是会员的核心权益。
            对话记录自动存档，随时回来继续。
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="section-tag mb-3 flex items-center gap-2">
                <span className="w-2 h-2 border border-ink inline-block" />通用层 · 免费
              </div>
              <div className="space-y-2.5">{general.map((a) => <AgentItem key={a.id} a={a} />)}</div>
            </div>
            <div>
              <div className="section-tag mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-vermilion inline-block" />学科层 · 会员专属
              </div>
              <div className="space-y-2.5">{subject.map((a) => <AgentItem key={a.id} a={a} />)}</div>
            </div>

            <div className="ledger-card-flat p-4">
              <div className="section-tag mb-3">当前智能体能力</div>
              <div className="flex flex-wrap gap-2">
                {active.skills.map((s) => (
                  <span key={s} className="text-xs border border-black/25 px-2.5 py-1">{s}</span>
                ))}
              </div>
              {active.pro && (
                <p className="text-xs text-ink-faint mt-3 leading-relaxed">
                  内置{active.subject}教学法模型 · 会员每月 500 次额度可用
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <ChatPanel key={active.id} agent={active} onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}
