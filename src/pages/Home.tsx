import { scenarios } from "../data";
import { MaskedTitle, SectionTag, type PageKey } from "../components/chrome";

const marqueeWords = [
  "备课", "教学设计", "解题诊断", "写作画像", "口语陪练", "分层作业",
  "虚拟探究", "讲评脚本", "任务群设计", "学情分析", "课程体系", "能力认证",
];

export default function Home({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  return (
    <div>
      {/* ===== Hero ===== */}
      <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-5">
        <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-7">
            <div className="section-tag mb-6 flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-vermilion" />
              面向中小学教师 · 不分学科 · 不分学段
            </div>
            <h1 className="font-serif-cn font-bold text-4xl md:text-6xl leading-[1.15] tracking-wide mb-6">
              <MaskedTitle text="把 AI 教进" />
              <br />
              <span className="text-vermilion">
                <MaskedTitle text="每一堂课" />
              </span>
              <span className="font-serif-cn text-2xl md:text-4xl align-middle text-ink-soft">
                <MaskedTitle text="，不只停在工具清单" />
              </span>
            </h1>
            <p className="text-ink-soft text-base md:text-lg leading-relaxed max-w-xl mb-8">
              不只让 AI 帮你干活——更要改变课堂本身：
              项目式学习、翻转课堂、跨学科主题学习，这些过去「设计重、落地难」的好教法，
              因为 AI 第一次变得人人可用；每位老师还能把教学智慧开发成有收益的原创资源。
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("agents")}
                className="bg-ink text-[#eef1ea] px-7 py-3.5 text-sm font-medium hover:bg-vermilion transition-colors shadow-[4px_4px_0_rgba(20,26,19,0.35)]"
              >
                体验学科智能体 →
              </button>
              <button
                onClick={() => onNavigate("courses")}
                className="border border-ink px-7 py-3.5 text-sm font-medium hover:bg-ink hover:text-[#eef1ea] transition-colors"
              >
                浏览课程体系
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-px bg-ink/20 border border-ink max-w-lg">
              {[
                ["17+", "实操课程"],
                ["5 种", "创新教学法"],
                ["2 层", "智能体架构"],
              ].map(([n, l]) => (
                <div key={l} className="bg-paper-card px-4 py-4">
                  <div className="font-serif-cn font-bold text-2xl">{n}</div>
                  <div className="text-xs text-ink-faint tracking-widest mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero 右侧：手账卡片——诊断仪演示 */}
          <div className="md:col-span-5 md:pt-8">
            <div className="ledger-card ledger-hover p-6 rotate-1">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-ink">
                <span className="section-tag">数学解题诊断仪</span>
                <span className="text-[10px] tracking-widest bg-ink text-[#eef1ea] px-2 py-0.5">学科层</span>
              </div>
              <div className="text-sm space-y-4">
                <div className="flex gap-2">
                  <span className="shrink-0 w-6 h-6 border border-ink text-[11px] flex items-center justify-center font-serif-cn">师</span>
                  <p className="bg-paper border border-black/15 px-3 py-2 leading-relaxed">
                    学生做「3.6÷0.4」得 0.9，错在哪？
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 w-6 h-6 bg-vermilion text-white text-[11px] flex items-center justify-center font-serif-cn">AI</span>
                  <div className="bg-paper border border-ink px-3 py-2 leading-relaxed">
                    <p className="font-medium mb-1">断点定位：商不变性质理解不牢</p>
                    <p className="text-ink-soft text-[13px]">
                      只移动了除数的小数点，被除数没动——典型的「规则半掌握」，不是粗心。已生成 3 级变式题链 →
                    </p>
                  </div>
                </div>
              </div>
              <div className="dash-line my-4" />
              <p className="text-xs text-ink-faint">不是判对错，是找出思维断在哪一步。</p>
            </div>

            <div className="ledger-card-flat p-4 -mt-3 -rotate-1 ml-8 flex items-center gap-3">
              <span className="text-vermilion font-serif-cn font-bold text-lg">评</span>
              <p className="text-xs text-ink-soft leading-relaxed">
                学完即练、练完即评：<br />每个微技能都有 AI 反馈评分
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 跑马灯 ===== */}
      <div className="border-y border-ink bg-paper-deep/60 py-3 overflow-hidden">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span key={i} className="mx-6 text-sm tracking-[0.3em] font-serif-cn text-ink whitespace-nowrap">
              {w} <span className="text-vermilion ml-6">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ===== 差异化：两层架构 ===== */}
      <section className="py-20 md:py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <SectionTag no="01" label="为什么是两层架构" />
          <h2 className="font-serif-cn font-bold text-3xl md:text-4xl mb-4 leading-snug">
            别人做「AI 能力 × 学科皮肤」<br className="hidden md:block" />
            我们做「学科教学法 × AI 能力」
          </h2>
          <p className="text-ink-soft max-w-2xl mb-12 leading-relaxed">
            换一套提示词模板，任何平台都能抄走；把学科教学论内置进智能体，才是抄不走的壁垒。
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="ledger-card-flat p-8 relative">
              <div className="absolute -top-3 left-6 bg-paper px-3 section-tag">第一层 · 免费</div>
              <h3 className="font-serif-cn font-bold text-2xl mb-1 mt-2">通用层智能体</h3>
              <p className="text-sm text-ink-soft mb-6">所有学科共用的教学助理 —— 「AI 帮你干活」</p>
              <ul className="space-y-3 text-sm">
                {["智能备课：课标对齐、教案生成、板书设计", "作业批改：错因归类、讲评脚本、家校反馈", "教研助手：听课记录分析、论文素材整理"].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="shrink-0 mt-1 w-3.5 h-3.5 border border-ink flex items-center justify-center text-[9px]">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-ink-faint border-t border-black/15 pt-4">
                定位：流量入口与信任建立，全部免费开放
              </p>
            </div>

            <div className="ledger-card p-8 relative bg-ink text-[#eef1ea]" style={{ boxShadow: "4px 4px 0 rgba(219,51,86,0.9)" }}>
              <div className="absolute -top-3 left-6 bg-vermilion text-white px-3 py-0.5 section-tag" style={{ color: "#fff" }}>
                第二层 · 会员专属
              </div>
              <h3 className="font-serif-cn font-bold text-2xl mb-1 mt-2">学科层智能体</h3>
              <p className="text-sm text-white/60 mb-6">内置学科教学法的专业教练 —— 「AI 嵌进学科教学」</p>
              <ul className="space-y-3 text-sm">
                {[
                  "数学解题诊断：断点定位 + 变式题链（变式教学理论）",
                  "语文写作画像：四维能力模型 + 跨学期追踪",
                  "英语口语陪练：按课标词汇量动态调整难度",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="shrink-0 mt-1 w-3.5 h-3.5 border border-vermilion text-vermilion flex items-center justify-center text-[9px]">★</span>
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-white/50 border-t border-white/20 pt-4">
                定位：核心付费点，持续扩充学科覆盖
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 创新教学 ===== */}
      <section className="py-20 md:py-24 px-5 bg-ink text-[#eef1ea]">
        <div className="mx-auto max-w-6xl">
          <SectionTag no="02" label="从提效到创新" light />
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="font-serif-cn font-bold text-3xl md:text-4xl leading-snug mb-5">
                改变课堂<br />而不只是给课堂提速
              </h2>
              <p className="text-white/60 leading-relaxed mb-8">
                项目式学习、翻转课堂、跨学科主题学习、大单元教学、情境化教学——
                这些教研会上一致叫好的方法，过去因为设计成本太高而落不了地。
                现在，AI 把设计成本降下来，好教法第一次人人可用。
              </p>
              <button
                onClick={() => onNavigate("lab")}
                className="bg-vermilion text-white px-7 py-3.5 text-sm font-medium hover:bg-[#eef1ea] hover:text-ink transition-colors"
              >
                进入教学创新实验室 →
              </button>
            </div>
            <div className="space-y-3">
              {[
                ["项目式学习", "两周项目，一课时备完"],
                ["翻转课堂", "课前先学真正发生"],
                ["跨学科主题学习", "找到学科间真实连接点"],
                ["资源开发工坊", "教学智慧变成有收益的作品"],
              ].map(([t, d], i) => (
                <div key={t} className="flex items-center gap-4 border border-white/20 px-5 py-4 hover:border-vermilion transition-colors">
                  <span className="font-serif-cn font-bold text-vermilion">0{i + 1}</span>
                  <div>
                    <div className="font-medium text-sm">{t}</div>
                    <div className="text-xs text-white/50">{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 学科深度场景 ===== */}
      <section className="py-20 md:py-24 px-5 bg-paper-deep/40 border-y border-ink">
        <div className="mx-auto max-w-6xl">
          <SectionTag no="03" label="浅层模板 vs 深度场景" />
          <h2 className="font-serif-cn font-bold text-3xl md:text-4xl mb-12">同一个学科，两种深度</h2>

          <div className="space-y-5">
            {scenarios.map((s, i) => (
              <div key={s.subject} className="ledger-card-flat ledger-hover grid md:grid-cols-12 gap-0">
                <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-ink p-5 flex md:flex-col items-start justify-between gap-2">
                  <span className="font-serif-cn font-bold text-xl">{s.subject}</span>
                  <span className="text-xs text-ink-faint">0{i + 1}</span>
                </div>
                <div className="md:col-span-4 p-5 border-b md:border-b-0 md:border-r border-black/15">
                  <div className="section-tag mb-2">浅层 · 换模板</div>
                  <p className="text-sm text-ink-faint line-through decoration-vermilion/60">{s.shallow}</p>
                </div>
                <div className="md:col-span-6 p-5 bg-paper">
                  <div className="section-tag mb-2 text-vermilion" style={{ color: "var(--vermilion)" }}>深层 · 学科教学法</div>
                  <p className="text-sm leading-relaxed">{s.deep}</p>
                  <p className="text-xs text-ink-faint mt-2">对应智能体：{s.agent}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => onNavigate("agents")} className="text-sm border-b-2 border-vermilion pb-1 hover:text-vermilion transition-colors">
              到智能体工作台亲自试一试 →
            </button>
          </div>
        </div>
      </section>

      {/* ===== 学练评闭环 + 认证 ===== */}
      <section className="py-20 md:py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <SectionTag no="04" label="学 — 练 — 评闭环" />
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { no: "①", t: "学", d: "10–15 分钟一节实操微课，以学科教学问题命题，不讲工具讲场景——「阅读理解总丢分？用 AI 建诊断档案」。" },
              { no: "②", t: "练", d: "每课配一个可复用的智能体或提示词模板，学完直接在平台实操，生成自己班级的真实材料。" },
              { no: "③", t: "评", d: "智能体对实操作品打分给反馈，学习记录自动沉淀为成果档案袋，三阶能力认证可上链存证。" },
            ].map((s) => (
              <div key={s.t} className="ledger-card ledger-hover p-7">
                <div className="font-serif-cn text-4xl font-bold text-vermilion mb-3">{s.no}</div>
                <h3 className="font-serif-cn font-bold text-xl mb-3">{s.t}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 ledger-card-flat p-8 md:p-10 grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <div className="section-tag mb-3">能力认证体系</div>
              <h3 className="font-serif-cn font-bold text-2xl mb-3">初阶 · 中阶 · 高阶，让成长看得见、用得上</h3>
              <p className="text-sm text-ink-soft leading-relaxed max-w-xl">
                从「AI 工具使用」到「AI 教学设计」再到「AI 课程开发」，每阶考核通过颁发电子证书、支持上链存证，
                可计入继续教育学时与校本研修成果——证书是老师评职称的刚需，也是平台的付费锚点。
              </p>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <button
                onClick={() => onNavigate("pricing")}
                className="bg-vermilion text-white px-7 py-3.5 text-sm font-medium hover:bg-ink transition-colors"
              >
                查看会员与认证权益
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-ink text-[#eef1ea] py-20 px-5">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-tag text-white/50 mb-6">( 05 ) 现在开始</div>
          <h2 className="font-serif-cn font-bold text-3xl md:text-5xl leading-snug mb-6">
            第一节课、前 20 次生成<br />全部免费
          </h2>
          <p className="text-white/60 mb-10">用你明天就要上的那节课来试，最有说服力。</p>
          <button
            onClick={() => onNavigate("agents")}
            className="bg-vermilion text-white px-10 py-4 text-sm font-medium hover:bg-[#eef1ea] hover:text-ink transition-colors"
          >
            免费体验智能体 →
          </button>
        </div>
      </section>
    </div>
  );
}
