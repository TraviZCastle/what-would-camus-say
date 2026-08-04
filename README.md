# What Would Camus Say

一个帮助用户从加缪思想出发重新审视现实困境的纯静态网页工具。

> 基于加缪作品与思想研究进行的系统推演，不代表加缪本人，也不是加缪原话。

需求、MVP 范围、架构约束与验收标准以 [PRODUCT_PLAN.md](./PRODUCT_PLAN.md) 为唯一事实来源。协作 Agent 开始工作前还应阅读 [AGENTS.md](./AGENTS.md)。

## 当前状态

Phase 0 已完成。Phase 1 已建立内容模型、来源目录、引文库、同义词与安全规则结构，并起草了 23 张覆盖全部 12 个主主题的种子卡片。

所有种子内容均为 AI 辅助草稿，目前 5 张已由产品审核为 `approved`，其余 18 张仍为 `review`。人工思想、版权与安全审核完成前，生产构建会主动失败，项目不会进入检索实现或公开部署。

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
```

`pnpm build` 和 `pnpm validate:production` 会执行严格生产门槛：至少 300 张已审核卡片、每个主题至少 15 张、同义词表已审核且权利状态明确。通过后构建输出到 `dist/`，可部署到任意 HTTPS 静态托管服务。

## 架构边界

- 纯静态 Vite + React + TypeScript 应用。
- 用户问题只在浏览器内处理，不进入 URL、服务端或分析日志。
- MVP 不允许 API route、server action、AI SDK、模型推理或数据库。
- `pnpm check:architecture` 会阻止已知 AI SDK 依赖和服务端执行路径进入构建。
