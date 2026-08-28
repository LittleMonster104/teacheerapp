import { useMemo, useState } from "react";
import { courses } from "../data";
import { allLessons } from "../content/lessons";
import { allActivities, type Activity } from "../content/activities";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { type PageKey } from "../components/chrome";

/** 轻量 Markdown 渲染：## 标题 / - 列表 / > 提示 / ``` 代码块 / **加粗** */
function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="text-ink font-semibold">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

function LessonContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("```")) {
          const code = trimmed.replace(/^```\n?/, "").replace(/```$/, "");
          return (
            <pre key={i} className="bg-ink text-[#d8e0d4] text-[13px] leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap border-l-4 border-vermilion">
              {code}
            </pre>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={i} className="font-serif-cn font-bold text-lg pt-3 flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-vermilion inline-block" />
              {trimmed.slice(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <div key={i} className="bg-paper-deep/40 border border-black/15 px-4 py-3 text-sm leading-relaxed">
              {renderInline(trimmed.slice(2))}
            </div>
          );
        }
        if (trimmed.split("\n").every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="space-y-2 text-sm leading-relaxed">
              {trimmed.split("\n").map((l, j) => (
                <li key={j} className="flex gap-2.5">
                  <span className="shrink-0 mt-2 w-2 h-2 border border-ink inline-block" />
                  <span>{renderInline(l.trim().slice(2))}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="text-sm leading-[1.9] text-ink-soft">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

/** 随堂检测：单题即时反馈 */
function QuizSection({ activity, lessonKey }: { activity: Activity; lessonKey: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;

  return (
    <div className="mt-8 border border-ink bg-paper-card p-5" key={lessonKey}>
      <div className="section-tag mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-ink inline-block" />随堂检测
      </div>
      <p className="text-sm font-medium mb-4 leading-relaxed">{activity.quiz.q}</p>
      <div className="space-y-2">
        {activity.quiz.options.map((opt, i) => {
          const isRight = i === activity.quiz.answer;
          const isPicked = i === picked;
          let cls = "border-black/20 hover:border-ink";
          if (answered) {
            if (isRight) cls = "border-green-700 bg-green-50";
            else if (isPicked) cls = "border-vermilion bg-red-50";
            else cls = "border-black/10 opacity-60";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`w-full text-left text-sm px-4 py-2.5 border transition-colors ${cls}`}
            >
              <span className="font-serif-cn font-bold mr-2">{["①", "②", "③", "④"][i]}</span>
              {opt}
              {answered && isRight && <span className="ml-2 text-green-700">✓</span>}
              {answered && isPicked && !isRight && <span className="ml-2 text-vermilion">✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`mt-4 text-[13px] leading-relaxed px-4 py-3 border ${picked === activity.quiz.answer ? "border-green-700/40 bg-green-50/50" : "border-vermilion/40 bg-red-50/50"}`}>
          <span className="font-medium">{picked === activity.quiz.answer ? "答对了：" : "解析："}</span>
          {activity.quiz.explain}
        </div>
      )}
    </div>
  );
}

/** 实操作业：提交后 AI 按量规批改 */
function PracticeSection({
  activity,
  courseId,
  lessonTitle,
  isAuthenticated,
  onNavigate,
}: {
  activity: Activity;
  courseId: string;
  lessonTitle: string;
  isAuthenticated: boolean;
  onNavigate: (p: PageKey) => void;
}) {
  const utils = trpc.useUtils();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ feedback: string; score: number | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const evaluate = trpc.course.evaluate.useMutation({
    onSuccess: (data) => {
      setResult({ feedback: data.feedback, score: data.score });
      setError(null);
      utils.account.me.invalidate();
      utils.course.mySubmissions.invalidate();
    },
    onError: (e) => setError(e.message),
  });

  const submit = () => {
    setError(null);
    evaluate.mutate({
      courseId,
      lessonIndex: activity.lessonIndex,
      lessonTitle,
      taskPrompt: activity.task.prompt,
      rubric: activity.task.rubric,
      submission: text,
    });
  };

  return (
    <div className="mt-6 border border-ink bg-paper-card p-5" style={{ boxShadow: "4px 4px 0 rgba(219,51,86,0.25)" }}>
      <div className="section-tag mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-vermilion inline-block" />实操作业 · AI 教研员批改
      </div>
      <p className="text-sm leading-relaxed mb-4">{activity.task.prompt}</p>

      {result ? (
        <div className="border border-vermilion bg-paper p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="section-tag">批改反馈</span>
            {result.score && (
              <span className="text-vermilion font-serif-cn tracking-widest">
                {"★".repeat(result.score)}{"☆".repeat(5 - result.score)}
              </span>
            )}
          </div>
          <p className="text-sm leading-[1.9] whitespace-pre-wrap">{result.feedback}</p>
          <p className="mt-4 pt-3 border-t border-black/10 text-xs text-ink-faint">
            已存入你的成果档案袋 · 可继续学习下一节
          </p>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAuthenticated ? activity.task.placeholder : "登录后提交作业，AI 教研员按量规批改"}
            disabled={!isAuthenticated || evaluate.isPending}
            rows={5}
            className="w-full border border-ink bg-paper px-3.5 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-vermilion disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <span className="text-xs text-ink-faint">非会员每次批改消耗 1 学分 · 会员免费</span>
            {isAuthenticated ? (
              <button
                onClick={submit}
                disabled={evaluate.isPending || text.trim().length < 10}
                className="bg-ink text-[#eef1ea] px-6 py-2.5 text-sm font-medium hover:bg-vermilion transition-colors disabled:opacity-40"
              >
                {evaluate.isPending ? "教研员批改中…" : "提交批改"}
              </button>
            ) : (
              <button
                onClick={() => onNavigate("login")}
                className="bg-ink text-[#eef1ea] px-6 py-2.5 text-sm font-medium hover:bg-vermilion transition-colors"
              >
                登录后提交
              </button>
            )}
          </div>
          {error && (
            <div className="mt-3 text-xs border border-vermilion/50 bg-red-50 px-3 py-2.5 text-vermilion">
              {error === "CREDITS_EXHAUSTED"
                ? "学分不足，请到会员定价页充值或开通会员"
                : error === "AI_NOT_CONFIGURED"
                  ? "模型服务未配置（LLM_API_KEY），请联系平台管理员"
                  : error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CourseDetail({
  courseId,
  onBack,
  onNavigate,
}: {
  courseId: string;
  onBack: () => void;
  onNavigate: (p: PageKey) => void;
}) {
  const course = courses.find((c) => c.id === courseId);
  const lessons = allLessons[courseId] ?? [];
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: account } = trpc.account.me.useQuery(undefined, { enabled: isAuthenticated });
  const member = !!account?.member;

  const { data: progressRows } = trpc.course.myProgress.useQuery(undefined, { enabled: isAuthenticated });
  const completed = progressRows?.find((r) => r.courseId === courseId)?.completedLessons ?? 0;

  const mark = trpc.course.mark.useMutation({
    onSuccess: () => utils.course.myProgress.invalidate(),
  });

  const [current, setCurrent] = useState(0);

  const canRead = (idx: number) => {
    const l = lessons[idx];
    if (!l?.content) return false;
    if (course?.free) return true;
    if (idx === 0) return true; // 首节试看
    return member;
  };

  const doneCount = Math.min(completed, lessons.length);
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const currentLesson = lessons[current];
  const readable = canRead(current);
  const isDone = current < doneCount;
  const activity = useMemo(
    () => allActivities[courseId]?.find((a) => a.lessonIndex === current),
    [courseId, current]
  );

  const totalMinutes = useMemo(() => lessons.reduce((s, l) => s + l.minutes, 0), [lessons]);

  if (!course) return null;

  return (
    <div className="pt-24 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <button onClick={onBack} className="text-sm text-ink-soft hover:text-vermilion mb-6">
          ← 返回课程列表
        </button>

        {/* 课程头部 */}
        <div className="ledger-card-flat p-6 md:p-8 mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] tracking-widest border border-ink px-2 py-0.5">{course.kind}</span>
            <span className="text-[10px] tracking-widest border border-black/25 text-ink-soft px-2 py-0.5">
              {course.subject} · {course.stage}
            </span>
            {course.free ? (
              <span className="text-[10px] tracking-widest bg-ink text-[#eef1ea] px-2 py-0.5">免费</span>
            ) : (
              <span className="text-[10px] tracking-widest bg-vermilion text-white px-2 py-0.5">会员 · 首节试看</span>
            )}
          </div>
          <h1 className="font-serif-cn font-bold text-2xl md:text-3xl leading-snug mb-3">{course.title}</h1>
          <p className="text-sm text-ink-soft leading-relaxed max-w-3xl mb-5">{course.desc}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-ink-faint">
            <span>{lessons.length} 节 · 共约 {totalMinutes} 分钟</span>
            <span className="text-vermilion">结业产出：{course.outcome}</span>
          </div>
          {/* 进度条 */}
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-ink-faint">学习进度</span>
              <span className="text-vermilion font-medium">{doneCount}/{lessons.length} 节 · {pct}%</span>
            </div>
            <div className="h-2 bg-black/10 border border-black/15">
              <div className="h-full bg-vermilion transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* 课时列表 */}
          <div className="lg:col-span-4">
            <div className="section-tag mb-3">课时目录</div>
            <div className="space-y-2">
              {lessons.map((l, i) => {
                const readableI = canRead(i);
                const active = i === current;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-full text-left p-3.5 border transition-colors flex items-start gap-3 ${
                      active
                        ? "bg-ink text-[#eef1ea] border-ink"
                        : readableI
                          ? "border-black/20 bg-paper-card hover:border-ink"
                          : "border-black/10 bg-paper/50"
                    }`}
                  >
                    <span className={`shrink-0 font-serif-cn font-bold text-sm mt-0.5 ${
                      active ? "text-vermilion" : i < doneCount ? "text-vermilion" : "text-ink-faint"
                    }`}>
                      {i < doneCount ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className={`block text-[13px] font-medium leading-snug ${!readableI && !active ? "text-ink-faint" : ""}`}>
                        {l.title}
                      </span>
                      <span className={`block text-[11px] mt-1 ${active ? "text-white/50" : "text-ink-faint"}`}>
                        {l.minutes} 分钟
                        {!course.free && i > 0 && !member && " · 🔒 会员"}
                        {!course.free && i > 0 && member && !l.content && " · 更新中"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 正文 */}
          <div className="lg:col-span-8">
            <div className="ledger-card p-6 md:p-9 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink">
                <span className="section-tag">第 {current + 1} 节 · {currentLesson.minutes} 分钟</span>
                {isDone && <span className="text-[10px] tracking-widest text-vermilion border border-vermilion px-2 py-0.5">已完成</span>}
              </div>

              {readable ? (
                <>
                  <h2 className="font-serif-cn font-bold text-xl md:text-2xl mb-6 leading-snug">{currentLesson.title}</h2>
                  <div className="flex-1">
                    <LessonContent content={currentLesson.content!} />
                    {activity && (
                      <>
                        <QuizSection activity={activity} lessonKey={`${courseId}-${current}`} />
                        <PracticeSection
                          activity={activity}
                          courseId={courseId}
                          lessonTitle={currentLesson.title}
                          isAuthenticated={isAuthenticated}
                          onNavigate={onNavigate}
                        />
                      </>
                    )}
                  </div>
                  <div className="dash-line my-7" />
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                      onClick={() => setCurrent(Math.max(0, current - 1))}
                      disabled={current === 0}
                      className="text-sm border border-ink px-5 py-2.5 hover:bg-ink hover:text-[#eef1ea] transition-colors disabled:opacity-30"
                    >
                      ← 上一节
                    </button>
                    {isAuthenticated ? (
                      <button
                        onClick={() => mark.mutate({ courseId, completedLessons: Math.max(doneCount, current + 1) })}
                        disabled={isDone || mark.isPending}
                        className="bg-vermilion text-white px-6 py-2.5 text-sm font-medium hover:bg-ink transition-colors disabled:opacity-40"
                      >
                        {isDone ? "本节已完成 ✓" : "完成本节 →"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate("login")}
                        className="bg-ink text-[#eef1ea] px-6 py-2.5 text-sm font-medium hover:bg-vermilion transition-colors"
                      >
                        登录后打卡进度
                      </button>
                    )}
                    <button
                      onClick={() => setCurrent(Math.min(lessons.length - 1, current + 1))}
                      disabled={current === lessons.length - 1}
                      className="text-sm border border-ink px-5 py-2.5 hover:bg-ink hover:text-[#eef1ea] transition-colors disabled:opacity-30"
                    >
                      下一节 →
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <span className="font-serif-cn text-4xl text-ink-faint mb-4">🔒</span>
                  <h3 className="font-serif-cn font-bold text-lg mb-2">{currentLesson.title}</h3>
                  <p className="text-sm text-ink-soft max-w-sm leading-relaxed mb-6">
                    {member
                      ? "本节内容正在教研打磨中，将陆续上线。已解锁的课时可以继续学习。"
                      : "本节为会员内容。开通会员即可解锁全部训练营课程，首节免费试看无需付费。"}
                  </p>
                  {!member && (
                    <button
                      onClick={() => onNavigate("pricing")}
                      className="bg-vermilion text-white px-7 py-3 text-sm font-medium hover:bg-ink transition-colors"
                    >
                      开通会员解锁 →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
