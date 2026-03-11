# ai-news-agent 開発スケジュール

**前提**: 仕事後に2h/日、不定期（週3〜4日ペース想定）
**開始日**: 2026-03-11

---

## 全体サマリー

| フェーズ | 内容概要 | 作業量目安 | 期間目安 |
|---|---|---|---|
| Phase 1 | MVP CLI（RSS取得・要約・md出力） | 約8h（4セッション） | 〜2026-03-25 |
| Phase 2 | 内側エージェント化（Tool use・embedding・LLM-as-judge） | 約16h（8セッション） | 〜2026-04-25 |
| Phase 3 | MCPサーバー化・Claude Code連携 | 約8h（4セッション） | 〜2026-05-10 |
| Phase 4 | 拡張（Xブックマーク・差分検出・togu統合） | 随時 | 2026-05以降 |

---

## Phase 1 — MVP CLI

**期間**: 2026-03-11 〜 2026-03-25（約2週間）
**作業量**: 8h（2h × 4日）

**やること**:
1. プロジェクト初期設定（TypeScript, rss-parser）
2. 複数RSSソース取得 + クエリフィルタリング（HN / Zenn / dev.to）
3. Claude API連携（要約・翻訳・High/Mid/Low分類）
4. Markdown出力 + CLI完成

**完了基準**: `ai-news-agent "クエリ"` で `./output/YYYY-MM-DD.md` が生成できる

---

## Phase 2 — 内側エージェント化

**期間**: 2026-03-26 〜 2026-04-25（約1ヶ月）
**作業量**: 16h（2h × 8日）

**やること**:
1. Tool use設計（fetchRSS / webSearch / checkDuplicate / scoreArticle をLLMが呼び出す形に再設計）
2. Multi-Query実装（情報不足と判断したら追加検索するループ）
3. Web検索連携（Tavily API または Perplexity API）
4. embeddingによる重複除去（Voyage AI または OpenAI embedding + コサイン類似度）
5. LLM-as-judge による重要度スコアリング（0〜10のスコア）
6. エージェントループの統合テスト

**完了基準**: 重複記事が目視で明らかに減り、重要度順が体感で正しい

---

## Phase 3 — MCPサーバー化・二重エージェント構造

**期間**: 2026-04-26 〜 2026-05-10（約2週間）
**作業量**: 8h（2h × 4日）

**やること**:
1. `@modelcontextprotocol/sdk` でMCPサーバーとして再実装
2. `fetch_ai_news` ツール（query / date / limit）の公開
3. `claude_desktop_config.json` への登録
4. Claude Code TUIから自然言語でニュース収集できることを確認

**完了基準**: Claude Codeに「今日のMCPニュースを取得して」と指示するだけでmd生成が完結する

---

## Phase 4 — 拡張（2026-05以降、優先度に応じて随時）

**やること（優先度順）**:
- ソース追加（GitHub Trending / arXiv / 海外テックブログ）
- 過去ダイジェストとの差分検出（「先週から続いているトレンド」の検出）
- togu CLIとの統合（`togu news` コマンド）
- Xブックマークとの統合（API制約があるため後回し）
- Zenn記事執筆時のリサーチ入力として自動連携

---

## マイルストーン

| 日付 | マイルストーン |
|---|---|
| 2026-03-25 | Phase 1完了 — CLIでmd生成が動く |
| 2026-04-25 | Phase 2完了 — 自律エージェントループが動く |
| 2026-05-10 | Phase 3完了 — Claude Codeから自然言語で呼び出せる |
| 2026-05以降 | Phase 4随時拡張 |
