import { useMemo, useState } from "react";
import { courses, type Course } from "../data";
import { allLessons } from "../content/lessons";
import { SectionTag } from "../components/chrome";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const subjects = ["全部", "跨学科", "语文", "数学", "英语", "物理", "化学"];
const kinds = ["全部", "通识微课", "学科训练营"];

function CourseCard({
  c,
  progress,
  onOpen,
  authed,
}: {
  c: Course;
  progress?: number;
  onOpen: () => void;
  authed: boolean;
}) {
  const started = progress !== undefined;
  const total = allLessons[c.id]?.length ?? c.lessons;
  const pct = started ? Math.min(100, Math.round((progress / total) * 100)) : 0;

  return (
    <div className="ledger-card-flat ledger-hover p-6 flex flex-col cursor-pointer" onClick={onOpen}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <span className="text-[10px] tracking-widest border border-ink px-2 py-0.5">{c.kind}</span>
          <span className="text-[10px] tracking-widest border border-black/25 text-ink-soft px-2 py-0.5">
            {c.subject} · {c.stage}
          </span>
        </div>
        {c.free ? (
          <span className="text-[10px] tracking-widest bg-ink text-[#eef1ea] px-2 py-0.5">免费</span>
        ) : (
          <span className="text-[10px] tracking-widest bg-vermilion text-white px-2 py-0.5">会员</span>
        )}
      </div>
      <h3 className="font-serif-cn font-bold text-lg leading-snug mb-3">{c.title}</h3>
      <p className="text-sm text-ink-soft leading-relaxed flex-1">{c.desc}</p>
      <div className="dash-line my-4" />
      <div className="flex items-center justify-between text-xs text-ink-faint">
        <span>{total} 节 · {c.minutes} 分钟 · {c.level}</span>
        <span className="text-vermilion">进入学习 →</span>
      </div>
      <div className="mt-3 bg-paper-deep/40 border border-black/15 px-3 py-2 text-xs leading-relaxed">
        <span className="text-vermilion font-medium">产出：</span>{c.outcome}
      </div>

      {started && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-ink-faint">已学 {progress}/{total} 节</span>
            <span className="text-vermilion font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 bg-black/10 border border-black/15">
            <div className="h-full bg-vermilion transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      {!started && !authed && (
        <p className="mt-4 text-[11px] text-ink-faint">登录后可记录学习进度</p>
      )}
    </div>
  );
}

export default function Courses({
  onOpenCourse,
}: {
  onOpenCourse: (id: string) => void;
}) {
  const [subject, setSubject] = useState("全部");
  const [kind, setKind] = useState("全部");
  const { isAuthenticated } = useAuth();

  const { data: progressRows } = trpc.course.myProgress.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const progressMap = useMemo(() => {
    const m = new Map<string, number>();
    progressRows?.forEach((r) => m.set(r.courseId, r.completedLessons));
    return m;
  }, [progressRows]);

  const list = useMemo(
    () =>
      courses.filter(
        (c) => (subject === "全部" || c.subject === subject) && (kind === "全部" || c.kind === kind)
      ),
    [subject, kind]
  );

  return (
    <div className="pt-28 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <SectionTag no="01" label="课程体系" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif-cn font-bold text-3xl md:text-5xl mb-4">按教学问题选课<br />不按工具功能选课</h1>
            <p className="text-ink-soft max-w-xl leading-relaxed">
              每门课从一个真实的学科教学痛点出发，配套可直接复用的智能体与模板，学完带走一份能用的教学成果。
            </p>
          </div>
          <div className="text-sm text-ink-faint">共 {list.length} 门</div>
        </div>

        {/* 筛选 */}
        <div className="ledger-card-flat p-5 mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-tag mr-2">学科</span>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`text-sm px-3.5 py-1.5 border transition-colors ${
                  subject === s ? "bg-ink text-[#eef1ea] border-ink" : "border-black/25 text-ink-soft hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-tag mr-2">类型</span>
            {kinds.map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={`text-sm px-3.5 py-1.5 border transition-colors ${
                  kind === k ? "bg-vermilion text-white border-vermilion" : "border-black/25 text-ink-soft hover:border-ink"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((c) => (
            <CourseCard
              key={c.id}
              c={c}
              authed={isAuthenticated}
              progress={progressMap.get(c.id)}
              onOpen={() => onOpenCourse(c.id)}
            />
          ))}
        </div>

        {/* 学习路径 */}
        <div className="mt-20">
          <SectionTag no="02" label="三阶成长路径" />
          <div className="grid md:grid-cols-3 gap-px bg-ink/20 border border-ink">
            {[
              { t: "初阶 · AI 工具使用", d: "通识微课 + 通用层智能体，会用、用对、用得安全。", tag: "免费" },
              { t: "中阶 · AI 教学设计", d: "学科训练营 + 学科层智能体，把 AI 嵌进学科教学法。", tag: "会员" },
              { t: "高阶 · AI 课程开发", d: "校本课程体系设计，产出可申报的校本 AI 课程方案。", tag: "认证营" },
            ].map((p, i) => (
              <div key={p.t} className="bg-paper-card p-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif-cn text-2xl font-bold text-ink-faint">0{i + 1}</span>
                  <span className="text-[10px] tracking-widest border border-ink px-2 py-0.5">{p.tag}</span>
                </div>
                <h3 className="font-serif-cn font-bold text-lg mb-2">{p.t}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
