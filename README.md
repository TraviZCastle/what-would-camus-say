# What Would Camus Say

一个帮助用户从加缪思想出发重新审视现实困境的纯静态网页工具。

> 基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。

需求、MVP 范围、架构约束与验收标准以 [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) 为唯一事实来源。协作 Agent 开始工作前还应阅读 [AGENTS.md](./AGENTS.md)。

## 当前状态

Phase 0 与 Phase 1 已完成。Phase 2 已实现浏览器内中文查询处理、受控查询扩展、字段加权 BM25、候选多样性、低置信度处理、离线索引和开发调试视图。

23 张种子卡片现已由产品审核为 `approved`。50 条种子评测的 Top 3 召回率和无结果准确率均为 100%。同义词表、安全规则和正式发布内容规模仍未达到生产门槛，生产构建会继续主动失败。

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

内容草稿校验：

```bash
pnpm content:validate
pnpm evaluate:retrieval
```

`pnpm build` 和 `pnpm validate:production` 会执行严格生产门槛：至少 300 张已审核卡片、每个主题至少 15 张、同义词表已审核且权利状态明确。通过后构建输出到 `dist/`，可部署到任意 HTTPS 静态托管服务。

## 架构边界

- 纯静态 Vite + React + TypeScript 应用。
- 用户问题只在浏览器内处理，不进入 URL、服务端或分析日志。
- MVP 不允许 API route、server action、AI SDK、模型推理或数据库。
- `pnpm check:architecture` 会阻止已知 AI SDK 依赖和服务端执行路径进入构建。
