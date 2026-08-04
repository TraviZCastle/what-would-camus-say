# Phase 1 种子内容人工审阅清单

审阅对象：[seed-cards.json](./cards/seed-cards.json)。当前 23 张卡片已全部由产品审核为 `approved`。

第一批审核记录：`PlainTerranThomas` 于 2026-08-04 批准数据文件顺序中的前 5 张卡片。

批量审核记录：`PlainTerranThomas` 于 2026-08-04 明确批准其余 18 张卡片进入下一阶段。

每张卡片至少检查：

1. `principle` 是否准确表达对应作品的思想，而非借加缪之名表达一般建议。
2. `explanation`、`answerBlocks` 是否只是可追溯的现实推演，没有补充无来源事实。
3. `boundary`、`counterMisreadings` 与 `negativeSignals` 是否足以阻止极端化和安全误用。
4. `sources` 的作品与章节定位是否准确；当前没有任何直接引文。
5. `rightsStatus` 是否适用于计划部署的司法辖区与所用版本。

## 卡片索引

| 主主题     | 卡片                                        | 标题                     | 主要来源                   |
| ---------- | ------------------------------------------- | ------------------------ | -------------------------- |
| absurd     | `absurd-repetitive-work-001`                | 清醒地面对重复劳动       | 《西西弗神话》             |
| absurd     | `absurd-failure-without-total-judgment-001` | 失败不替全部生活宣判     | 《西西弗神话》             |
| meaning    | `meaning-world-silence-001`                 | 不要急着填满世界的沉默   | 《西西弗神话》             |
| work       | `work-necessity-choice-001`                 | 在必要之中辨认选择       | 《西西弗神话》             |
| freedom    | `freedom-choice-consequences-001`           | 把后果带回选择之中       | 《西西弗神话》             |
| freedom    | `freedom-shared-limit-001`                  | 自由在共同限度前停下     | 《反抗者》                 |
| revolt     | `revolt-injustice-without-nihilism-001`     | 反抗不以毁灭为终点       | 《反抗者》                 |
| revolt     | `revolt-no-affirms-value-001`               | 说不也在肯定某种价值     | 《反抗者》                 |
| revolt     | `revolt-dialogue-without-surrender-001`     | 保持对话不等于放弃立场   | 《既非受害者，也非刽子手》 |
| limits     | `limits-work-harm-001`                      | 坚持不是无限度忍受       | 《反抗者》                 |
| limits     | `limits-means-ends-001`                     | 目的不能免除手段的审查   | 《反抗者》                 |
| conscience | `conscience-compromise-limit-001`           | 妥协需要一条说得出的界线 | 《反抗者》                 |
| conscience | `conscience-role-self-judgment-001`         | 不把社会角色当成全部判断 | 《反抗者》                 |
| solidarity | `solidarity-shared-condition-001`           | 从个人拒绝走向共同处境   | 《反抗者》                 |
| solidarity | `solidarity-witness-action-001`             | 在无保证时做共同的事     | 《鼠疫》                   |
| solidarity | `solidarity-relationship-distance-001`      | 关系中的团结不取消距离   | 《反抗者》《鼠疫》         |
| hope       | `hope-without-appeal-001`                   | 希望不能替代对现实的观看 | 《西西弗神话》             |
| hope       | `hope-disappointment-reality-001`           | 失望之后仍然看见现实     | 《夏天集》                 |
| happiness  | `happiness-sensory-present-001`             | 让幸福回到可以经验的当下 | 《婚礼集》                 |
| happiness  | `happiness-without-denial-001`              | 不让幸福以遗忘为代价     | 《夏天集》《鼠疫》         |
| mortality  | `mortality-finite-time-001`                 | 死亡意识把时间变得具体   | 《西西弗神话》             |
| action     | `action-reversible-first-step-001`          | 在没有保证时先做有限一步 | 《反抗者》                 |
| action     | `action-create-without-guarantee-001`       | 创造不需要终极保证       | 《西西弗神话》             |

## 审核后操作

只对逐张完成核对的卡片：

- 将 `status` 改为 `approved`。
- 将 `reviewer` 改为真实编辑标识。
- 将 `reviewedAt` 改为实际审核日期。
- 在 `reviewNotes` 记录修改内容、版本与仍存争议。

同义词表和安全规则需要分别审核；它们的状态不会随卡片审核自动改变。完成后运行：

```bash
pnpm content:validate
```
