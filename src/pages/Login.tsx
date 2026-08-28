import { useState } from "react";
import { trpc } from "@/providers/trpc";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const [tab, setTab] = useState<"local" | "kimi">("local");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", password: "", name: "" });
  const [error, setError] = useState<string | null>(null);

  const { data: localAuth } = trpc.localAuth.enabled.useQuery();

  const onSuccess = () => {
    window.location.assign("/");
  };

  const register = trpc.localAuth.register.useMutation({ onSuccess, onError: (e) => setError(e.message) });
  const login = trpc.localAuth.login.useMutation({ onSuccess, onError: (e) => setError(e.message) });

  const pending = register.isPending || login.isPending;

  const submit = () => {
    setError(null);
    if (mode === "register") {
      register.mutate({ username: form.username, password: form.password, name: form.name || form.username });
    } else {
      login.mutate({ username: form.username, password: form.password });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-16">
      <div className="ledger-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="inline-flex w-12 h-12 bg-ink text-[#eef1ea] font-serif-cn font-bold items-center justify-center text-xl mb-4">
            师
          </span>
          <h1 className="font-serif-cn font-bold text-2xl">
            {mode === "login" ? "欢迎回来" : "创建账号"}
          </h1>
          <p className="text-xs text-ink-faint mt-2 tracking-widest">登录即赠 20 学分体验额度</p>
        </div>

        {/* 登录方式切换 */}
        <div className="grid grid-cols-2 gap-px bg-ink/20 border border-ink mb-6">
          {localAuth?.enabled !== false && (
            <button
              onClick={() => setTab("local")}
              className={`py-2.5 text-sm transition-colors ${tab === "local" ? "bg-ink text-[#eef1ea] font-medium" : "bg-paper-card text-ink-soft hover:text-ink"}`}
            >
              账号密码
            </button>
          )}
          <button
            onClick={() => setTab("kimi")}
            className={`py-2.5 text-sm transition-colors ${tab === "kimi" ? "bg-ink text-[#eef1ea] font-medium" : "bg-paper-card text-ink-soft hover:text-ink"}`}
          >
            Kimi 一键登录
          </button>
        </div>

        {tab === "kimi" ? (
          <div className="space-y-4">
            <p className="text-xs text-ink-soft leading-relaxed text-center">
              跳转至 Kimi 官方授权页完成登录，平台不接触你的密码
            </p>
            <button
              onClick={() => (window.location.href = getOAuthUrl())}
              className="w-full bg-ink text-[#eef1ea] py-3.5 text-sm font-medium hover:bg-vermilion transition-colors"
            >
              使用 Kimi 账号继续 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-ink-faint block mb-1.5">称呼（如：张老师）</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion"
                  placeholder="将显示在你发布的资源上"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-ink-faint block mb-1.5">用户名</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion"
                placeholder="3–32 位，中英文数字均可"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="text-xs text-ink-faint block mb-1.5">密码</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion"
                placeholder={mode === "register" ? "至少 6 位" : "输入密码"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            </div>

            {error && <p className="text-xs text-vermilion">{error}</p>}

            <button
              onClick={submit}
              disabled={pending || form.username.length < 3 || form.password.length < (mode === "register" ? 6 : 1)}
              className="w-full bg-ink text-[#eef1ea] py-3.5 text-sm font-medium hover:bg-vermilion transition-colors disabled:opacity-40"
            >
              {pending ? "请稍候…" : mode === "login" ? "登 录" : "注册并登录"}
            </button>

            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="w-full text-xs text-ink-faint hover:text-vermilion transition-colors pt-1"
            >
              {mode === "login" ? "还没有账号？立即注册" : "已有账号？直接登录"}
            </button>
          </div>
        )}

        <div className="dash-line my-6" />
        <p className="text-[11px] text-ink-faint text-center leading-relaxed">
          登录即代表同意《用户协议》与《隐私政策》<br />教师数据默认不用于模型训练
        </p>
      </div>
    </div>
  );
}
