import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // 演示兑换码：年度会员 + 学分充值
  await db
    .insert(schema.redemptionCodes)
    .values([
      { code: "SHIYU2026", kind: "member_year" },
      { code: "TEACH100", kind: "credits", credits: 100 },
    ])
    .onDuplicateKeyUpdate({ set: { code: "SHIYU2026" } });

  // 资源库示例内容
  const existing = await db.select().from(schema.resources).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.resources).values([
      {
        authorId: 1,
        authorName: "平台教研组",
        title: "「校园里的数学」情境题单（四年级）",
        type: "情境题单",
        subject: "数学",
        stage: "小学",
        description: "6 个校园场景 × 每场景 3 题，把数学放回学生每天生活的场景里。",
        content: `【场景一：操场】
① 基础：学校新跑道一圈 200 米，画线需要多少米白漆？
② 进阶：直道长 50 米，两端是半圆，求跑道全长。
③ 挑战：如果白漆每桶能画 120 米，28 元一桶，预算多少？

【场景二：食堂】
① 基础：一份营养午餐 15 元，主食 4 元、荤菜 6 元，素菜和汤共多少元？
② 进阶：设计一份 15 元内的搭配，要求荤素齐全。
③ 挑战：全班 40 人订餐，预算 600 元，你的方案够吗？

【答案与使用说明见教师版】`,
        points: 0,
      },
      {
        authorId: 1,
        authorName: "平台教研组",
        title: "《荷花》第二课时教案 + 生长式板书设计",
        type: "互动课件",
        subject: "语文",
        stage: "小学",
        description: "含分环节流程、追问话术、预设学生回答与板书设计图。",
        content: `【教学目标】边读边想象画面，体会优美生动的语句。

【环节一】复习导入（3分钟）
听写第一课时词语：荷花、清香、圆盘、花瓣……同桌互批。

【环节二】精读 2-4 段（20分钟）
抓「冒、展开、饱胀」三个动词，让学生做动作体会。
追问话术：「冒」换成「长」好不好？为什么？
预设：学生会说「冒」更有力——肯定并引导体会用词准确。

【环节三】想象拓展（12分钟）
闭眼听配乐朗读，说说自己仿佛看到了什么。

【板书】生长式：看（叶·花）→ 想（我变成了荷花），随课推进逐步呈现。`,
        points: 2,
      },
    ]);
  }

  console.log("Done.");
  process.exit(0);
}

seed();
