import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export type PageKey = "home" | "lab" | "courses" | "agents" | "library" | "pricing" | "login";

export const navItems: { key: PageKey; label: string }[] = [
  { key: "home", label: "首页" },
  { key: "lab", label: "教学创新" },
  { key: "courses", label: "课程体系" },
  { key: "agents", label: "智能体工作台" },
  { key: "library", label: "资源库" },
  { key: "pricing", label: "会员定价" },
];

/** 章节编号标签：参考教育类落地页的编号叙事 */
export function SectionTag({ no, label, light }: { no: string; label: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span
        className={`section-tag inline-flex items-center gap-2 border px-2.5 py-1 ${
          light ? "border-white/40 text-white/70" : "border-ink"
        }`}
      >
        <span className={light ? "text-white" : "text-vermilion"}>({no})</span>
        {label}
      </span>
      <span className={`h-px flex-1 ${light ? "bg-white/25" : "bg-black/20"}`} />
    </div>
  );
}

/** 词级遮罩入场标题 */
export function MaskedTitle({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((ch, i) => (
        <span key={i} className="reveal-mask">
          <span className="reveal-word" style={{ animationDelay: `${i * 0.045}s` }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

/** 账户徽标：学分余额 + 会员状态 */
function AccountBadge() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: account } = trpc.account.me.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden lg:flex items-center gap-2 text-xs border border-ink px-2.5 py-1.5 bg-paper-card">
        <span className="text-ink-faint">学分</span>
        <span className="font-serif-cn font-bold text-vermilion">{account?.balance ?? "…"}</span>
        {account?.member && (
          <span className="bg-vermilion text-white text-[10px] px-1.5 py-0.5 tracking-widest">会员</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {user.avatar ? (
          <img src={user.avatar} alt="" className="w-7 h-7 border border-ink object-cover" />
        ) : (
          <span className="w-7 h-7 bg-ink text-[#eef1ea] text-xs flex items-center justify-center font-serif-cn">
            {(user.name ?? "师")[0]}
          </span>
        )}
        <span className="text-sm max-w-24 truncate hidden sm:inline">{user.name ?? "老师"}</span>
        <button onClick={logout} className="text-xs text-ink-faint hover:text-vermilion">
          退出
        </button>
      </div>
    </div>
  );
}

export function TopNav({ page, onNavigate }: { page: PageKey; onNavigate: (p: PageKey) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-ink transition-all ${
        scrolled ? "bg-paper/95 backdrop-blur shadow-[0_4px_0_rgba(20,26,19,0.9)]" : "bg-paper"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 group">
          <span className="w-8 h-8 bg-ink text-[#eef1ea] font-serif-cn font-bold flex items-center justify-center text-sm group-hover:bg-vermilion transition-colors">
            师
          </span>
          <span className="font-serif-cn font-bold text-lg tracking-wide">
            师语<span className="text-vermilion">AI</span>
          </span>
          <span className="hidden md:inline text-[10px] tracking-[0.2em] text-ink-faint border-l border-black/20 pl-2.5 ml-1">
            教师 AI 教学力成长平台
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`px-3.5 py-2 text-sm tracking-wide transition-colors relative ${
                page === item.key ? "text-ink font-semibold" : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
              {page === item.key && (
                <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-[3px] bg-vermilion" />
              )}
            </button>
          ))}
          {!isLoading &&
            (isAuthenticated ? (
              <div className="ml-3">
                <AccountBadge />
              </div>
            ) : (
              <button
                onClick={() => onNavigate("login")}
                className="ml-3 bg-ink text-[#eef1ea] text-sm px-5 py-2 font-medium hover:bg-vermilion transition-colors"
              >
                免费开始
              </button>
            ))}
        </nav>

        <button className="md:hidden text-2xl leading-none" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink bg-paper">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setOpen(false);
              }}
              className={`block w-full text-left px-6 py-3.5 text-sm border-b border-black/10 ${
                page === item.key ? "font-semibold text-vermilion" : "text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate(isAuthenticated ? "pricing" : "login");
              setOpen(false);
            }}
            className="block w-full text-left px-6 py-3.5 text-sm font-semibold text-vermilion"
          >
            {isAuthenticated ? "我的账户" : "登录 / 免费开始"}
          </button>
        </div>
      )}
    </header>
  );
}

export function Footer({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  return (
    <footer className="bg-ink text-[#eef1ea] mt-0">
      <div className="mx-auto max-w-6xl px-5 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 bg-[#eef1ea] text-ink font-serif-cn font-bold flex items-center justify-center text-sm">师</span>
            <span className="font-serif-cn font-bold text-lg">师语AI</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            不只教老师用 AI 工具，更把 AI 嵌进每个学科的教学法里。
            通用能力免费学，学科深度场景与认证服务构成可持续的商业闭环。
          </p>
        </div>
        <div>
          <div className="section-tag text-white/50 mb-4">导航</div>
          {navItems.map((i) => (
            <button key={i.key} onClick={() => onNavigate(i.key)} className="block text-sm text-white/70 hover:text-white py-1.5">
              {i.label}
            </button>
          ))}
        </div>
        <div>
          <div className="section-tag text-white/50 mb-4">合作</div>
          <p className="text-sm text-white/70 py-1.5">学校版批量采购</p>
          <p className="text-sm text-white/70 py-1.5">教育局师训项目</p>
          <p className="text-sm text-white/70 py-1.5">hello@shiyuai.example</p>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-6xl px-5 py-5 flex flex-col md:flex-row justify-between gap-2 text-xs text-white/40">
          <span>© 2026 师语AI · 中小学教师 AI 教学力成长平台</span>
          <span>生成式 AI 服务接入备案模型 · 教师数据默认不用于训练</span>
        </div>
      </div>
    </footer>
  );
}
