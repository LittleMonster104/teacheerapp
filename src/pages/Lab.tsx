import { useState } from "react";
import { methods, pipeline, resourceTypes } from "../data";
import { SectionTag, type PageKey } from "../components/chrome";

export default function Lab({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const [activeMethod, setActiveMethod] = useState(methods[0].id);
  const method = methods.find((m) => m.id === activeMethod)!;

  return (
    <div className="pt-28 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <SectionTag no="01" label="教学创新实验室" />
        <div className="mb-12">
          <h1 className="font-serif-cn font-bold text-3xl md:text-5xl mb-4 leading-tight">
            用 AI 改变课堂<br />而不只是给课堂提速
          </h1>
          <p className="text-ink-soft max-w-2xl leading-relaxed">
            批改快一点只是开始。真正的价值在于：项目式学习、翻转课堂这些过去「设计重、落地难」的好教法，
            因为 AI 第一次变得人人可用——同时每位老师都能把教学智慧变成可分享、有收益的原创资源。
          </p>
        </div>

        {/* ===== 创新教学法方法库 ===== */}
        <div className="grid lg:grid-cols-12 gap-6 mb-20">
          <div className="lg:col-span-4">
            <div className="section-tag mb-3">方法库 · 五种创新教学法</div>
            <div className="space-y-2.5">
              {methods.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMethod(m.id)}
                  className={`w-full text-left p-4 border transition-colors flex items-center gap-3 ${
                    activeMethod === m.id ? "bg-ink text-[#eef1ea] border-ink" : "border-black/20 bg-paper-card hover:border-ink"
                  }`}
                >
                  <span className={`font-serif-cn font-bold text-lg ${activeMethod === m.id ? "text-vermilion" : "text-ink-faint"}`}>
                    0{i + 1}
                  </span>
                  <span className="font-medium text-sm">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 方法详情：传统 vs AI */}
          <div className="lg:col-span-8">
            <div className="ledger-card p-7 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-ink">
                <h2 className="font-serif-cn font-bold text-2xl">{method.name}</h2>
                <span className="text-[10px] tracking-widest border border-ink px-2 py-0.5">方法 {method.id.toUpperCase()}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-5 flex-1">
                <div className="border border-black/20 p-5">
                  <div className="section-tag mb-3">传统课堂的坎</div>
                  <p className="text-sm text-ink-soft leading-relaxed">{method.pain}</p>
                </div>
                <div className="border border-vermilion bg-paper p-5" style={{ boxShadow: "3px 3px 0 rgba(219,51,86,0.35)" }}>
                  <div className="section-tag mb-3 text-vermilion" style={{ color: "var(--vermilion)" }}>有了 AI 之后</div>
                  <p className="text-sm leading-relaxed">{method.withAI}</p>
                </div>
              </div>

              <div className="mt-5 bg-paper-deep/40 border border-black/15 p-5">
                <div className="section-tag mb-2">真实课例</div>
                <p className="text-sm leading-relaxed">{method.example}</p>
              </div>

              <div className="dash-line my-5" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-ink-faint">配套智能体：{method.agent}</span>
                <button
                  onClick={() => onNavigate("courses")}
                  className="text-sm border-b-2 border-vermilion pb-0.5 hover:text-vermilion transition-colors"
                >
                  查看配套训练营 →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== 资源开发工坊 ===== */}
        <SectionTag no="02" label="资源开发工坊" />
        <div className="mb-10">
          <h2 className="font-serif-cn font-bold text-3xl md:text-4xl mb-4">每位老师都是资源创作者</h2>
          <p className="text-ink-soft max-w-2xl leading-relaxed">
            过去开发一套原创资源要熬几个周末；现在 AI 负责初稿和排版，老师负责教学判断。
            做好的一键发布到资源库——被下载，就有收益。
          </p>
        </div>

        {/* 流水线 */}
        <div className="grid md:grid-cols-4 gap-px bg-ink/20 border border-ink mb-10">
          {pipeline.map((p) => (
            <div key={p.step} className="bg-paper-card p-6">
              <div className="font-serif-cn font-bold text-vermilion text-lg mb-1">{p.step}</div>
              <h3 className="font-serif-cn font-bold text-lg mb-2.5">{p.title}</h3>
              <p className="text-[13px] text-ink-soft leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* 资源类型 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {resourceTypes.map((r) => (
            <div key={r.name} className="ledger-card-flat ledger-hover p-5 flex items-start gap-4">
              <span className="shrink-0 w-9 h-9 border border-ink font-serif-cn flex items-center justify-center text-sm">
                {r.name[0]}
              </span>
              <div>
                <div className="font-medium text-sm mb-1">{r.name}</div>
                <p className="text-xs text-ink-soft leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 激励说明 */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="ledger-card p-7">
            <div className="section-tag mb-3">创作者激励</div>
            <ul className="space-y-3 text-sm">
              {[
                "免费资源被下载 → 赚积分，可兑换会员时长",
                "付费资源按下载分成，平台仅抽 30%",
                "带可编辑源文件的资源，下载量平均高 3 倍",
                "月度名师榜单首页展播，沉淀个人品牌",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="shrink-0 mt-1 w-3.5 h-3.5 border border-ink flex items-center justify-center text-[9px]">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-ink text-[#eef1ea] p-7 border border-ink" style={{ boxShadow: "6px 6px 0 rgba(219,51,86,0.9)" }}>
            <div className="section-tag text-white/50 mb-3">一个典型的创作闭环</div>
            <p className="text-sm leading-relaxed text-white/85">
              张老师用资源工坊把「校园里的数学」想法变成 18 页情境题单，周三上架，首周被下载 240 次，
              赚到 1,200 积分和 ¥86 分成。更重要的是——<span className="text-vermilion font-medium">全省有 200 多个班级在用她的教学思路上课。</span>
            </p>
            <button
              onClick={() => onNavigate("agents")}
              className="mt-6 bg-vermilion text-white px-6 py-3 text-sm font-medium hover:bg-[#eef1ea] hover:text-ink transition-colors"
            >
              去资源工坊试试 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
