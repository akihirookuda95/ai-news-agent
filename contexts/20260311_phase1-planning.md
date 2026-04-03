# セッションコンテキスト: Phase 1 計画・ドキュメント整備

**日付**: 2026-03-11
**ブランチ**: `develop`

---

## 1. 目的（Goal）

- `docs/ai-news-agent-spec.md` の内容を理解し、プロジェクト全体像を把握する
- Phase 1〜4 の開発スケジュールを策定してドキュメント化する
- git管理を開始し、`docs/` を初期コミットする

---

## 2. 現在地（Current status）

**完了**:
- 仕様書 (`docs/ai-news-agent-spec.md`) の内容把握・メモリ保存
- Phase 1 の2h×4セッション実装計画 → `docs/dev-notes/memo.md` 作成
- Phase 1〜4 の全体スケジュール → `docs/schedule.md` 作成
- `docs/` 配下を2コミットに分けてgit管理開始

**進行中**: なし（実装はまだ未着手）

---

## 3. 重要な決定（Key decisions）

- **作業ペース**: 仕事後に2h/日、週3〜4日
- **Phase 1期間**: 2026-03-11〜03-25（4セッション・8h）
  - 記録: `docs/schedule.md`
- **コミット分割方針**: 「仕様書」と「計画ドキュメント」を意図単位で2コミットに分離
- **`.gitignore` 追加予定**: `.env`, `node_modules/`, `dist/`, `output/`（実装開始前に追加）

---

## 4. 未決事項・不明点（Open questions / Unknowns）

- **Tavily vs Perplexity**: Web検索APIはどちらを使うか未決（Phase 2で決定）
  - 理由: Phase 1では不要。Phase 2突入時にAPI料金・精度を比較して決める
- **Embedding provider**: Voyage AI vs OpenAI embedding（Phase 2で決定）
- **`output/` をgit管理するか**: 現在は `.gitignore` 予定。変更するなら早めに決める

---

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

**二重エージェント構造（最終形）**:
- 外側: Claude Code (TUI) → `fetch_ai_news` MCPツールを呼び出す
- 内側: ai-news-agent (MCPサーバー) → 収集・評価・整形を担当

**Phase 1 の構成（シンプルなCLI）**:
```
src/
  index.ts         # CLI エントリーポイント
  fetchRSS.ts      # rss-parser で HN / Zenn / dev.to 取得
  summarize.ts     # Claude API で要約・翻訳・High/Mid/Low 分類
  writeMarkdown.ts # output/YYYY-MM-DD.md 生成
```

**RSSソース（Phase 1）**:
| ソース | URL |
|---|---|
| Hacker News | `https://news.ycombinator.com/rss` |
| Zenn | `https://zenn.dev/feed` |
| dev.to | `https://dev.to/feed` |

**CLIインターフェース（Phase 1）**:
```bash
ai-news-agent "クエリ"
# → ./output/YYYY-MM-DD.md を生成
```

---

## 6. 関連ファイル（Files touched / relevant files）

| ファイル | 変更内容 |
|---|---|
| `docs/ai-news-agent-spec.md` | プロジェクト仕様書（新規追加）|
| `docs/schedule.md` | Phase 1〜4 全体スケジュール（新規追加）|
| `docs/dev-notes/memo.md` | Phase 1 実装メモ・4セッション計画（新規追加）|
| `~/.claude/projects/.../memory/MEMORY.md` | プロジェクトメモリ（新規作成）|

**関連コミット**:
- `7484059` — docs: プロジェクト仕様書を追加
- `62e2eb4` — docs: 開発スケジュールとPhase 1実装メモを追加

---

## 7. 評価文脈（Evaluation context）

N/A（実装未着手）

---

## 8. 次回やること（Next steps）

1. `.gitignore` を作成してコミット（`.env`, `node_modules/`, `dist/`, `output/`）
2. `npm init -y` + TypeScript環境構築（`tsconfig.json`, `tsx`）
3. `rss-parser` を導入し `fetchRSS.ts` を実装（HN RSSをパース）
4. 記事の統一フォーマット型 `Article` を定義
5. 複数ソース（Zenn / dev.to）対応 + CLIクエリフィルタリング
6. Claude API（`@anthropic-ai/sdk`）連携で要約・翻訳・重要度分類
7. `writeMarkdown.ts` で `output/YYYY-MM-DD.md` 生成
8. 動作確認 → Phase 1完了

**Phase 1完了基準**: `ai-news-agent "LLM"` で仕様通りの `output/YYYY-MM-DD.md` が生成される

---

## 9. リスク（Risks / gotchas）

- **Claude API料金**: 全記事を1件ずつ要約すると記事数×コストになる。`Promise.all` + 同時5件制限で速度とコストのバランスをとる
- **RSS構造の差異**: ソースによってフィールド名が異なる（`content` vs `content:encoded` など）。パース時に正規化ロジックが必要
- **APIキー漏洩**: `.env` のコミットを防ぐため、`.gitignore` を実装前に必ず追加する
- **クエリフィルタリングの精度**: タイトル/本文の単純なキーワードマッチはノイズが多い。Phase 2で改善予定なのでPhase 1では割り切る

---

## 10. 参考（References）

- [Anthropic SDK ドキュメント](https://docs.anthropic.com/) — Claude API連携（Day 3で使用）
- [rss-parser npm](https://www.npmjs.com/package/rss-parser) — RSS取得（Day 1で使用）
- [MCP仕様](https://modelcontextprotocol.io/) — Phase 3で参照
