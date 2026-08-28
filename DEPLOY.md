# 师语AI · 部署指南

中小学教师 AI 教学力成长平台 —— 全栈应用（React + tRPC + MySQL + OpenAI 兼容模型接口）。

---

## 一、环境变量说明（.env）

在项目根目录创建 `.env` 文件：

```bash
# ===== 数据库（Docker 部署时无需填写，compose 会自动注入）=====
DATABASE_URL=mysql://root:你的密码@localhost:3306/shiyuai

# ===== AI 模型（OpenAI 兼容协议，必填否则智能体不可用）=====
# 本地 Ollama：http://localhost:11434/v1
# Moonshot 开放平台：https://api.moonshot.cn/v1
LLM_BASE_URL=http://localhost:11434/v1
LLM_MODEL=qwen2.5:14b
LLM_API_KEY=ollama          # Ollama 填任意非空；Moonshot 填真实 sk- 密钥

# ===== 登录体系 =====
APP_ID=local-dev             # 仅账号密码登录时填占位值即可
APP_SECRET=换成足够长的随机字符串   # 重要：用于签发登录会话，生产必须修改
VITE_APP_ID=local-dev
VITE_KIMI_AUTH_URL=https://auth.kimi.com
KIMI_AUTH_URL=https://auth.kimi.com
KIMI_OPEN_URL=https://open.kimi.com
OWNER_UNION_ID=

# ===== 可选 =====
# LOCAL_AUTH=0               # 设为 0 可关闭账号密码登录入口
# DB_PASSWORD=123456         # Docker 部署时 MySQL 的 root 密码
```

---

## 二、服务器部署（推荐，Docker 一键）

**前置**：一台 Linux 服务器，安装 Docker：

```bash
curl -fsSL https://get.docker.com | bash
```

**步骤**：

```bash
# 1. 上传代码到服务器（本地执行）
rsync -avz --exclude node_modules --exclude dist ./ root@服务器IP:/opt/teacherapp/

# 2. 服务器上创建 .env（见上方模板）

# 3. 一键启动（应用 + MySQL 一起起来）
cd /opt/teacherapp
docker compose up -d --build

# 4. 首次初始化数据库（仅第一次需要）
docker compose exec app npm run db:push
docker compose exec app npx tsx db/seed.ts

# 5. 访问 http://服务器IP:3000
```

**运维命令**：

```bash
docker compose logs -f app     # 查看日志
docker compose restart app     # 重启
docker compose up -d --build   # 代码更新后重新部署
docker compose down            # 停止（数据保留在 Docker 卷中）
```

---

## 三、本地部署（macOS / 无 Docker）

**前置**：Node.js 20+、MySQL 8、Ollama（可选，用于 AI 功能）

```bash
# macOS 一键安装依赖
brew install node@20 mysql
brew services start mysql

# 建库
mysql -u root -e "CREATE DATABASE shiyuai DEFAULT CHARSET utf8mb4;"
```

**步骤**：

```bash
npm install                  # 安装依赖（国内建议先换源：npm config set registry https://registry.npmmirror.com）
npm run db:push              # 建表
npx tsx db/seed.ts           # 初始数据（体验兑换码 + 示例资源）
npm run build && npm start   # 构建并启动
# 访问 http://localhost:3000
```

开发模式（改动代码实时生效）：`npm run dev`

---

## 四、初始数据与体验流程

seed 写入的兑换码（可在 `db/seed.ts` 中修改）：

| 兑换码 | 内容 |
|---|---|
| `SHIYU2026` | 年度会员 |
| `TEACH100` | 100 学分 |

**验收流程**：注册账号 → 定价页兑换 `SHIYU2026` → 智能体工作台与「数学解题诊断仪」对话 → 课程页进入任意课程完成随堂检测与实操作业 → 资源库下载示例资源。

---

## 五、常见问题

| 问题 | 处理 |
|---|---|
| AI 对话报 `AI_NOT_CONFIGURED` | `.env` 未配置 `LLM_API_KEY`，或 Ollama 未启动（`ollama serve`） |
| AI 回复质量差 | 3B 模型仅适合调通链路，建议 14B 以上（`ollama pull qwen2.5:14b` 并改 `LLM_MODEL`） |
| `db:push` 报交互错误 | 在非交互终端换用 `npm run db:generate && npm run db:migrate` |
| 连不上数据库 | 确认 MySQL 已启动；Docker 部署时确认 `mysql` 容器健康（`docker compose ps`） |
| 端口被占用 | `lsof -ti:3000` 查看占用进程，或改 compose 端口映射 |

---

## 六、正式上线前清单

- [ ] `APP_SECRET` 换成随机长串
- [ ] `DB_PASSWORD` 使用强密码
- [ ] 服务器防火墙只放行 80/443，3000 走内网
- [ ] 前置 Nginx + HTTPS（Let's Encrypt）
- [ ] 如需在线支付，自行接入微信支付/支付宝商户（当前为兑换码开通模式）
- [ ] 面向公众提供 AI 服务，确认所用模型已完成国家备案
