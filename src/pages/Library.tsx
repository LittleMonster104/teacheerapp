import { useState } from "react";
import { SectionTag, type PageKey } from "../components/chrome";
import { resourceTypes } from "../data";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

const subjects = ["全部", "语文", "数学", "英语", "物理", "化学", "跨学科"];
const stages = ["小学", "初中", "高中", "全学段"];

function PublishForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    title: "",
    type: resourceTypes[0].name,
    subject: "语文",
    stage: "小学",
    description: "",
    content: "",
    points: 0,
  });
  const publish = trpc.resources.publish.useMutation({ onSuccess: onDone });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="ledger-card p-6 space-y-4">
      <div className="section-tag">发布原创资源</div>
      <input
        className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion"
        placeholder="资源标题，如「校园里的数学」情境题单（四年级）"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
      />
      <div className="grid grid-cols-3 gap-3">
        {[
          { k: "type", opts: resourceTypes.map((r) => r.name), label: "类型" },
          { k: "subject", opts: subjects.slice(1), label: "学科" },
          { k: "stage", opts: stages, label: "学段" },
        ].map((f) => (
          <label key={f.k} className="text-xs text-ink-faint">
            {f.label}
            <select
              className="mt-1 w-full border border-ink bg-paper px-2 py-2 text-sm text-ink"
              value={(form as Record<string, string | number>)[f.k] as string}
              onChange={(e) => set(f.k, e.target.value)}
            >
              {f.opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <textarea
        className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion"
        rows={2}
        placeholder="一句话介绍这份资源解决什么教学问题"
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
      />
      <textarea
        className="w-full border border-ink bg-paper px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-vermilion font-mono"
        rows={8}
        placeholder="粘贴资源正文（教案、题单、脚本……），可用「」和 ①②③ 组织结构"
        value={form.content}
        onChange={(e) => set("content", e.target.value)}
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <label className="text-xs text-ink-faint flex items-center gap-2">
          下载积分（0 = 免费赚积分）
          <input
            type="number"
            min={0}
            max={100}
            className="w-20 border border-ink bg-paper px-2 py-1.5 text-sm text-ink"
            value={form.points}
            onChange={(e) => set("points", Number(e.target.value))}
          />
        </label>
        <div className="flex items-center gap-3">
          {publish.error && <span className="text-xs text-vermilion">{publish.error.message}</span>}
          <button
            onClick={() => publish.mutate(form)}
            disabled={publish.isPending || form.title.length < 2 || form.content.length < 20}
            className="bg-ink text-[#eef1ea] px-6 py-2.5 text-sm font-medium hover:bg-vermilion transition-colors disabled:opacity-40"
          >
            {publish.isPending ? "发布中…" : "上架资源库"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Library({ onNavigate }: { onNavigate: (p: PageKey) => void }) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [subject, setSubject] = useState("全部");
  const [type, setType] = useState("全部");
  const [showPublish, setShowPublish] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { data: list, isLoading } = trpc.resources.list.useQuery({
    subject: subject === "全部" ? undefined : subject,
    type: type === "全部" ? undefined : type,
  });

  const download = trpc.resources.download.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.title}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice(`「${data.title}」已下载`);
      utils.resources.list.invalidate();
      utils.account.me.invalidate();
    },
    onError: (e) => setNotice(e.message === "CREDITS_EXHAUSTED" ? "学分不足，请先充值或升级会员" : e.message),
  });

  return (
    <div className="pt-28 pb-24 px-5 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <SectionTag no="01" label="教学资源库" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif-cn font-bold text-3xl md:text-5xl mb-4">老师的智慧<br />全省的课堂</h1>
            <p className="text-ink-soft max-w-xl leading-relaxed">
              这里每一份资源都出自一线教师之手。免费资源下载赚积分，付费资源作者分成 70%。
            </p>
          </div>
          <button
            onClick={() => (isAuthenticated ? setShowPublish(!showPublish) : onNavigate("login"))}
            className="bg-ink text-[#eef1ea] px-6 py-3 text-sm font-medium hover:bg-vermilion transition-colors shrink-0"
          >
            {showPublish ? "收起" : "+ 发布我的资源"}
          </button>
        </div>

        {showPublish && isAuthenticated && (
          <div className="mb-10">
            <PublishForm
              onDone={() => {
                setShowPublish(false);
                setNotice("发布成功，已进入资源库");
                utils.resources.list.invalidate();
              }}
            />
          </div>
        )}

        {notice && (
          <div className="ledger-card-flat p-3.5 mb-6 text-sm flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-ink-faint hover:text-vermilion">✕</button>
          </div>
        )}

        {/* 筛选 */}
        <div className="ledger-card-flat p-4 mb-8 flex flex-wrap gap-x-8 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-tag mr-1">学科</span>
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  subject === s ? "bg-ink text-[#eef1ea] border-ink" : "border-black/25 text-ink-soft hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="section-tag mr-1">类型</span>
            {["全部", ...resourceTypes.map((r) => r.name)].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  type === t ? "bg-vermilion text-white border-vermilion" : "border-black/25 text-ink-soft hover:border-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 列表 */}
        {isLoading ? (
          <p className="text-sm text-ink-faint py-10 text-center">加载中…</p>
        ) : !list || list.length === 0 ? (
          <div className="ledger-card-flat p-12 text-center">
            <p className="text-ink-soft text-sm mb-2">这个分类下还没有资源</p>
            <p className="text-xs text-ink-faint">成为第一个发布者，抢占新资源推荐位</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((r) => (
              <div key={r.id} className="ledger-card-flat ledger-hover p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-2">
                    <span className="text-[10px] tracking-widest border border-ink px-2 py-0.5">{r.type}</span>
                    <span className="text-[10px] tracking-widest border border-black/25 text-ink-soft px-2 py-0.5">
                      {r.subject} · {r.stage}
                    </span>
                  </div>
                  {r.points > 0 ? (
                    <span className="text-[10px] bg-vermilion text-white px-2 py-0.5 tracking-widest">{r.points} 学分</span>
                  ) : (
                    <span className="text-[10px] bg-ink text-[#eef1ea] px-2 py-0.5 tracking-widest">免费</span>
                  )}
                </div>
                <h3 className="font-serif-cn font-bold leading-snug mb-2">{r.title}</h3>
                <p className="text-[13px] text-ink-soft leading-relaxed flex-1">{r.description}</p>
                <div className="dash-line my-3.5" />
                <div className="flex items-center justify-between text-xs text-ink-faint">
                  <span>{r.authorName ?? "匿名老师"} · {r.downloads} 次下载</span>
                  <button
                    onClick={() => (isAuthenticated ? download.mutate({ id: r.id }) : onNavigate("login"))}
                    disabled={download.isPending}
                    className="border border-ink px-3 py-1.5 hover:bg-ink hover:text-[#eef1ea] transition-colors disabled:opacity-40"
                  >
                    下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
