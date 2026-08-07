# What Would Camus Say

一个帮助用户从加缪思想出发重新审视现实困境的中英双语纯静态网页工具。

> 回答正文是基于加缪作品与思想研究的系统推演，不代表加缪本人；结尾短引句来自独立审核的作品引文库，页面只显示书名。

需求、MVP 范围、架构约束与验收标准以 [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) 为唯一事实来源。协作 Agent 开始工作前还应阅读 [AGENTS.md](./AGENTS.md)。

## 当前状态

Phase 0–4 已完成。当前版本的问题输入界面固定使用英文；提交后按问题语言选择中文或英文索引，并只让结果页与确定性回答使用对应语言。系统不提供手动语言开关，也不调用翻译或生成 API。双语查询处理、受控查询扩展、字段加权 BM25、候选多样性、低置信度处理、离线索引和开发调试视图均在浏览器内运行。独立安全分流覆盖 6 类风险；抽象的自杀哲学问题进入正常检索，明确的个人意图、计划或即时危险仍在检索前分流。

Phase 5 已完成公开的方法、来源、隐私、版权和安全边界页面，并加入检索性能门禁。第二、三、四批分别新增 72、96 与 109 张卡片，另增加 1 张针对自杀哲学命题的补充卡片；知识库现为 301 张已审核卡片，覆盖 602 个版本化现实场景。

301 张卡片、中文与英文同义词表、安全规则和安全回答文案均为 `approved`。构建时由相同的 301 个卡片 ID 生成中英文两个只读索引，避免维护两套相互漂移的思想边界。中文检索金标与英文主题回归持续作为发布门禁；安全评测同时覆盖真实危险、抽象自杀哲学讨论及两种语境并存时的优先级。

## 本地开发

要求 Node.js 24+ 与 pnpm 11.9+。

```bash
pnpm install
pnpm dev
```

常用验证命令：

```bash
pnpm validate
pnpm test:e2e
```

本地开发服务器运行在 `4173` 端口时，可复现无障碍审计：

```bash
pnpm audit:accessibility
```

内容草稿校验：

```bash
pnpm content:generate:batch02
pnpm content:generate:batch03
pnpm content:generate:batch04
pnpm content:validate
pnpm evaluate:retrieval
pnpm benchmark:retrieval
```

`pnpm build` 和 `pnpm validate:production` 会执行严格生产门槛：至少 300 张已审核卡片、每个主题至少 15 张、同义词表、安全规则与安全回答文案均已审核，且权利状态明确。通过后构建输出到 `dist/`，可部署到任意 HTTPS 静态托管服务。

## 发布与维护

- 项目名：What Would Camus Say
- 本地目录：`/Users/test/Documents/ForFun/what-would-camus-say`
- GitHub：`https://github.com/TraviZCastle/what-would-camus-say`
- Vercel：团队 `chengzhangcs-9520s-projects`，项目 `what-would-camus-say`
- 生产地址：`https://camusian.vercel.app`
- 旧地址：`https://what-would-camus-say.vercel.app`（307 重定向到生产地址）
- 应用环境变量：无；用户问题始终只在浏览器内处理
- Git 提交作者：`PlainTerranThomas <PlainTerranThomas@users.noreply.github.com>`

Vercel 已连接 GitHub 的 `main` 分支。日常发布流程是先运行 `pnpm validate:production && pnpm test:e2e`，再提交并推送 `main`；Vercel 会从 Git 提交自动构建和发布 Production。

仓库使用独立的可写 Deploy Key 推送，私钥仅保存在本机 `/Users/test/.ssh/what-would-camus-say_deploy_key`，指纹为 `SHA256:gjwrArqFtb/fiWJjtKNPT4zZyGUEp+E4B1i/NhTKOag`。由于当前网络不开放 SSH 22 端口，仓库级 `core.sshCommand` 固定通过 `ssh.github.com:443` 连接；不要将私钥、`.vercel/` 或 `.env.local` 提交到 Git。

## 架构边界

- 纯静态 Vite + React + TypeScript 双语应用。
- 中文和英文索引在首页并行预取并使用长期静态缓存，提交时无需等待界面切换。
- 用户问题只在浏览器内处理，不进入 URL、服务端或分析日志。
- MVP 不允许 API route、server action、AI SDK、模型推理或数据库。
- `pnpm check:architecture` 会阻止已知 AI SDK 依赖和服务端执行路径进入构建。
