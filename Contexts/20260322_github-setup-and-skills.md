# Context: GitHub 環境整備・Skills 作成・ブランチ戦略

**日付**: 2026-03-22
**ブランチ**: `feature/issue-2-langgraphjs-basics`

---

## 1. 目的（Goal）

- GitHub Actions (Claude Code) の導入と動作確認
- gh コマンド用 Skills（gh-issue / gh-pr）の整備
- 学習ロードマップを Issue 化してプロジェクト管理の起点を作る
- ブランチ戦略を決定し、develop → main の統合を完了する

---

## 2. 現在地（Current status）

**完了**:
- `/install-github-app` による GitHub Actions ワークフロー導入（PR #1 マージ済み）
- `gh-issue` skill 作成・動作確認済み
- `gh-pr` skill 作成済み
- 学習ロードマップを Issue #2〜#5 として起票
- Issue #7（コードレビュー観点の定義）起票
- `develop` ブランチを `origin/main` にリベース → PR #6 作成・マージ
- `feature/issue-2-langgraphjs-basics` ブランチ作成・push 済み
- 未コミットファイル 2 件をコミット・push 済み

**進行中**:
- Issue #2（LangGraph.js 基本動作確認）は明日開始予定

---

## 3. 重要な決定（Key decisions）

- **ブランチ戦略: GitHub Flow**
  - 結論: `main` + `feature/issue-N-description` のみ。`develop` ブランチは廃止
  - 理由: ソロプロジェクト・ポートフォリオ用途のため Git Flow は過剰。PR 履歴が採用担当に見やすい形にする
  - 記録先: このコンテキストファイル（CLAUDE.md には未記載）

- **コードレビュー観点は CLAUDE.md に書く**
  - 結論: `claude-code-review.yml` は CLAUDE.md を参照してレビューするため、観点の定義先は CLAUDE.md
  - 理由: code-review プラグインが CLAUDE.md compliance agent を走らせる設計になっている
  - 記録先: Issue #7

- **gh-issue / gh-pr skill の設計方針**
  - 結論: ラベル事前確認・情報を1回でまとめて質問・`Closes #N` 必須付与の3点を標準化
  - 理由: 毎回同じ品質で作成するためのチェックリストとして機能させる
  - 記録先: `~/.claude/skills/gh-issue/SKILL.md` / `~/.claude/skills/gh-pr/SKILL.md`

---

## 4. 未決事項・不明点（Open questions / Unknowns）

- **Issue #7: コードレビュー観点の定義**
  - なぜ重要: CLAUDE.md の観点が具体的であるほど自動レビューの精度が上がる
  - 何が分かれば決められるか: 実装が進んで「どんなミスが起きやすいか」が分かってから決めるのが現実的。Issue #2 以降の実装開始後に議論する

- **`develop` ブランチの削除**
  - リモートにまだ `develop` ブランチが残っている可能性がある。不要なら削除する

---

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

### GitHub Actions ワークフロー（2本）

| ファイル | トリガー | 役割 |
|---|---|---|
| `claude-code-review.yml` | PR open/sync/reopen | 自動コードレビュー（CLAUDE.md 準拠 + バグ検出） |
| `claude.yml` | PR/Issue コメントで `@claude` メンション | 手動タスク実行 |

### Skills 構成

| skill | 場所 | 役割 |
|---|---|---|
| `gh-issue` | `~/.claude/skills/gh-issue/SKILL.md` | Issue 作成の標準化 |
| `gh-pr` | `~/.claude/skills/gh-pr/SKILL.md` | PR 作成の標準化（差分確認・Closes #N 付与） |

### settings.json 追加パーミッション

```
Bash(gh issue:*), Bash(gh label:*), Bash(gh repo view:*), Bash(gh auth status:*), Bash(gh pr:*)
```

---

## 6. 関連ファイル（Files touched / relevant files）

- `~/.claude/CLAUDE.md` — `gh-issue` / `gh-pr` を `available_skills` に追加
- `~/.claude/settings.json` — gh コマンド系パーミッションを追加
- `~/.claude/skills/gh-issue/SKILL.md` — 新規作成
- `~/.claude/skills/gh-pr/SKILL.md` — 新規作成
- `docs/learning-roamap.md` — 新規コミット (`d8cd857`)
- `docs/design-code-review-skills.md` — 新規コミット (`3e20c64`)
- `.github/workflows/claude-code-review.yml` — `/install-github-app` で自動生成（main ブランチ）
- `.github/workflows/claude.yml` — `/install-github-app` で自動生成（main ブランチ）

**関連コミット**:
- `d8cd857` — docs: プロジェクト開始前の学習ロードマップを追加
- `3e20c64` — docs: 設計力・コードレビュー力の鍛え方メモを追加
- `39db864` — Merge pull request #6 from akihirookuda95/develop

---

## 7. 評価文脈（Evaluation context）

N/A（学習・環境整備フェーズ）

---

## 8. 次回やること（Next steps）

1. Issue #2 を開始: `feature/issue-2-langgraphjs-basics` ブランチで作業
   - LangGraph.js リポジトリを Clone して `examples/intro/` を動かす
   - `examples/multi_agent/` の State 設計をメモ
   - 内側エージェント処理フローを手書きで描く
2. Issue #2 完了後 → 学習メモを `docs/` にコミット → `/gh-pr` で PR 作成（`Closes #2`）
3. Issue #3〜#5 も同様に進める
4. Issue #7（コードレビュー観点）: 実装が進んだタイミングで議論して CLAUDE.md に追記
5. `develop` ブランチをリモートから削除するか検討

---

## 9. リスク（Risks / gotchas）

- **`gh auth` のスコープ不足**: `workflow` スコープがないと GitHub Actions 関連操作が失敗する。`gh auth refresh -h github.com -s repo,workflow` で対処
- **ラベルなし Issue 作成エラー**: 存在しないラベルを指定すると `gh issue create` が失敗する。`gh label list` で事前確認必須
- **リベース後の force push**: `feature/*` ブランチでリベースした場合は `--force-with-lease` で push する（`--force` は使わない）
- **`develop` ブランチの残骸**: リモートに残っていると混乱の元になる。PR マージ後に削除推奨

---

## 10. 参考（References）

- `~/.claude/skills/gh-issue/SKILL.md` — Issue 作成 skill 定義
- `~/.claude/skills/gh-pr/SKILL.md` — PR 作成 skill 定義
- `docs/learning-roamap.md` — Week 1〜2 の学習計画（Issue #2〜#5 の元ネタ）
- GitHub Issues #2〜#5 — 学習ロードマップの Issue
- GitHub Issue #7 — コードレビュー観点定義タスク
