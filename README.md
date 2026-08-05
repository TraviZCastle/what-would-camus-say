# What Would Camus Say

一个帮助用户从加缪思想出发重新审视现实困境的中英双语纯静态网页工具。

> 基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。

需求、MVP 范围、架构约束与验收标准以 [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) 为唯一事实来源。协作 Agent 开始工作前还应阅读 [AGENTS.md](./AGENTS.md)。

## 当前状态

Phase 0–4 已完成。当前版本按浏览器语言初始化，并在用户输入达到可判断长度后自动切换中文或英文界面、索引和确定性回答；不提供手动语言开关，也不调用翻译或生成 API。双语查询处理、受控查询扩展、字段加权 BM25、候选多样性、低置信度处理、离线索引和开发调试视图均在浏览器内运行。独立安全分流覆盖 6 类风险，并在哲学检索前执行。

Phase 5 已完成公开的方法、来源、隐私、版权和安全边界页面，并加入检索性能门禁。第二、三、四批分别新增 72、96 与 109 张卡片，知识库现为 300 张已审核卡片；12 个主主题各 25 张，覆盖 600 个版本化现实场景。

300 张卡片、中文与英文同义词表、安全规则和安全回答文案均为 `approved`。构建时由相同的 300 个卡片 ID 生成中英文两个只读索引，避免维护两套相互漂移的思想边界。327 条中文检索评测中，323 条相关性问题的 Top 3 召回率和 4 条无结果准确率均为 100%；英文检索现有跨 6 类主题的自动化回归测试。120 条中文安全评测中，100 条风险正例的分流召回率和 20 条语境负例的准确率均为 100%，另有英文危机分流回归测试。

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

## 架构边界

- 纯静态 Vite + React + TypeScript 双语应用。
- 中文和英文索引按需加载，另一语言在浏览器空闲时后台预取并使用长期静态缓存。
- 用户问题只在浏览器内处理，不进入 URL、服务端或分析日志。
- MVP 不允许 API route、server action、AI SDK、模型推理或数据库。
- `pnpm check:architecture` 会阻止已知 AI SDK 依赖和服务端执行路径进入构建。
