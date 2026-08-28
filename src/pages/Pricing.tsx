import { useState } from "react";
import { pricing, creditPacks, faqs } from "../data";
import { SectionTag, type PageKey } from "../components/chrome";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

/** 我的账户 + 兑换码开通 */
function AccountPanel({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const utils = trpc.useUtils();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const { data: account } = trpc.account.me.useQuery(undefined, { enabled: isAuthenticated });
  const redeem = trpc.account.redeem.useMutation({
    onSuccess: (r) => {
      setMsg(r.message);
      utils.account.me.invalidate();
    },
    onError: (e) => setMsg(e.message),
  });

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="ledger-card p-8 mb-14 text-center">
        <p className="text-sm text-ink-soft mb-4">登录后可查看账户、开通会员、使用兑换码</p>
        <button
          onClick={() => onNavigate("login")}
          className="bg-ink text-[#eef1ea] px-8 py-3 text-sm font-medium hover:bg-vermilion transition-colors"
        >
          使用 Kimi 账号登录
        </button>
      </div>
    );
  }

  return (
    <div className="ledger-card p-7 mb-14 grid md:grid-cols-2 gap-8">
      <div>
        <div className="section-tag mb-4">我的账户</div>
        <div className="flex items-center gap-4 mb-5">
          <span className="w-11 h-11 bg-ink text-[#eef1ea] flex items-center justify-center font-serif-cn font-bold">
            {(user?.name ?? "师")[0]}
          </span>
          <div>
            <div className="font-medium">{user?.name ?? "老师"}</div>
            <div className="text-xs text-ink-faint">
              {account?.member
                ? `会员有效期至 ${account.planExpiresAt ? new Date(account.planExpiresAt).toLocaleDateString("zh-CN") : "—"}`
                : "免费版用户"}
            </div>
          </div>
          {account?.member && (
            <span className="bg-vermilion text-white text-[10px] tracking-widest px-2 py-1">会员</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-px bg-ink/20 border border-ink max-w-xs">
          <div className="bg-paper-card px-4 py-3">
            <div className="font-serif-cn font-bold text-xl text-vermilion">{account?.balance ?? 0}</div>
            <div className="text-[10px] tracking-widest text-ink-faint mt-0.5">剩余学分</div>
          </div>
          <div className="bg-paper-card px-4 py-3">
            <div className="font-serif-cn font-bold text-xl">{account?.transactions?.length ?? 0}</div>
            <div className="text-[10px] tracking-widest text-ink-faint mt-0.5">最近流水</div>
          </div>
        </div>
        {account?.transactions && account.transactions.length > 0 && (
          <div className="mt-4 space-y-1.5 max-w-xs">
            {account.transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex justify-between text-xs text-ink-soft">
                <span className="truncate mr-3">{t.reason}</span>
                <span className={t.delta > 0 ? "text-green-700" : "text-vermilion"}>
                  {t.delta > 0 ? `+${t.delta}` : t.delta}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="section-tag mb-4">兑换码开通</div>
        <p className="text-xs text-ink-soft leading-relaxed mb-4">
          平台暂未接入在线支付，会员与学分通过兑换码开通（可由活动赠送、学校批量采购发放）。
          输入兑换码即刻生效。
        </p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="输入兑换码，如 SHIYU2026"
            className="flex-1 border border-ink bg-paper px-3 py-2.5 text-sm tracking-widest focus:outline-none focus:ring-1 focus:ring-vermilion"
          />
          <button
            onClick={() => redeem.mutate({ code })}
            disabled={redeem.isPending || code.length < 4}
            className="bg-ink text-[#eef1ea] px-5 text-sm font-medium hover:bg-vermilion transition-colors disabled:opacity-40"
          >
            {redeem.isPending ? "兑换中…" : "兑换"}
          </button>
        </div>
        {msg && <p className="mt-3 text-sm text-vermilion">{msg}</p>}
        <p className="mt-4 text-[11px] text-ink-faint">新用户体验兑换码：SHIYU2026（年度会员）· TEACH100（100 学分）</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ledger-card-flat">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-medium text-sm">{q}</span>
        <span className={`text-lg transition-transform duration-200 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-60" : "max-h-0"}`}>
        <p className="px-5 pb-5 text-sm text-ink-soft leading-relaxed border-t border-black/10 pt-4">{a}</p>
      </div>
    </div>
  );
}

export default function Pricing({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  return (
    <div className="pt-28 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <SectionTag no="01" label="会员定价" />
        <div className="text-center mb-12">
          <h1 className="font-serif-cn font-bold text-3xl md:text-5xl mb-4">先免费用出价值<br />再为深度付费</h1>
          <p className="text-ink-soft max-w-xl mx-auto leading-relaxed">
            免费层让你体验「第一份满意的教案」；付费层解锁学科深度与能力认证。教师对积分制与免费增值的接受度最高——我们按这个设计。
          </p>
        </div>

        <AccountPanel onNavigate={onNavigate} />

        {/* 三档定价 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 items-stretch">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col p-7 ${
                p.highlight
                  ? "bg-ink text-[#eef1ea] border border-ink shadow-[6px_6px_0_rgba(219,51,86,0.9)]"
                  : "ledger-card-flat"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vermilion text-white text-[10px] tracking-[0.2em] px-3 py-1">
                  最受欢迎
                </span>
              )}
              <h3 className="font-serif-cn font-bold text-xl mb-1">{p.name}</h3>
              <p className={`text-xs mb-5 ${p.highlight ? "text-white/60" : "text-ink-faint"}`}>{p.desc}</p>
              <div className="mb-1">
                <span className="font-serif-cn font-bold text-4xl">{p.price}</span>
                <span className={`text-sm ${p.highlight ? "text-white/60" : "text-ink-faint"}`}>{p.unit}</span>
              </div>
              {"altPrice" in p && p.altPrice && (
                <div className="text-xs text-vermilion mb-2">{p.altPrice}</div>
              )}
              <div className={`h-px my-5 ${p.highlight ? "bg-white/20" : "dash-line"}`} />
              <ul className="space-y-2.5 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className={`shrink-0 mt-0.5 w-3.5 h-3.5 flex items-center justify-center text-[9px] border ${p.highlight ? "border-vermilion text-vermilion" : "border-ink"}`}>✓</span>
                    <span className={p.highlight ? "text-white/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-7 py-3 text-sm font-medium transition-colors ${
                  p.highlight
                    ? "bg-vermilion text-white hover:bg-[#eef1ea] hover:text-ink"
                    : "border border-ink hover:bg-ink hover:text-[#eef1ea]"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>

        {/* 积分包 */}
        <div className="mb-16">
          <SectionTag no="02" label="生成额度 · 积分包" />
          <div className="grid sm:grid-cols-3 gap-px bg-ink/20 border border-ink">
            {creditPacks.map((c) => (
              <div key={c.times} className="bg-paper-card p-6 flex items-center justify-between">
                <div>
                  <div className="font-serif-cn font-bold text-2xl">{c.times}</div>
                  <div className="text-xs text-ink-faint mt-1">{c.note}</div>
                </div>
                <div className="text-right">
                  <div className="font-serif-cn font-bold text-xl text-vermilion">{c.price}</div>
                  <button className="text-xs border-b border-ink mt-1 hover:text-vermilion hover:border-vermilion transition-colors">购买</button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint mt-3">额度用于智能体生成，当月有效；会员额度不足时自动提示补充。</p>
        </div>

        {/* 学校版 */}
        <div className="ledger-card p-8 md:p-10 mb-16 grid md:grid-cols-12 gap-6 items-center" style={{ boxShadow: "6px 6px 0 rgba(20,26,19,0.9)" }}>
          <div className="md:col-span-8">
            <div className="section-tag mb-3">( 03 ) toB 第二增长曲线</div>
            <h3 className="font-serif-cn font-bold text-2xl mb-3">学校版：管理后台 + 全员账号 + 校本培训</h3>
            <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
              当一所学校的老师密度足够高，升级学校版最划算：10 账号起订，含学习数据看板与入校培训服务，个人会员费可按比例抵扣。
            </p>
          </div>
          <div className="md:col-span-4 flex md:justify-end">
            <button className="bg-ink text-[#eef1ea] px-7 py-3.5 text-sm font-medium hover:bg-vermilion transition-colors">
              预约方案演示
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <SectionTag no="04" label="常见问题" />
          <div className="space-y-3 max-w-3xl">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
