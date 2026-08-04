# 内容资产

所有思想卡片、引文、来源、同义词和安全规则均受 schema 与版本控制约束。

当前 23 张种子卡片均由 AI 辅助起草，并已由产品批量审核为 `approved`。同义词和安全规则仍为 `review`，不能进入生产构建；它们需要分别核对查询扩展风险、危机召回与误报，再独立批准。

```bash
pnpm content:validate
pnpm content:validate:production
```

普通校验用于 Phase 1 草稿；生产校验会额外要求至少 300 张卡片、每个主题至少 15 张、全部资产已审核且权利状态明确。
