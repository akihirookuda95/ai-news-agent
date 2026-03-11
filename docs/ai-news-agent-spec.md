# AI ニュース収集エージェント 仕様書

**プロジェクト名**: ai-news-agent  
**作成日**: 2026-03-10  
**ステータス**: Draft

---

## 1. 概要

### 背景・課題

AI 技術の進化が速く、毎日大量のニュースが世界中で発信されている。X のブックマークを週 1 で斜め読みするワークフローでは情報の偏りやキャッチアップ漏れが発生しており、MCP のような重要技術のキャッチアップが数ヶ月遅れることがある。

### このエージェントが解決すること

- 世界中の AI 関連ニュースを自動収集し、重要度順に整理する
- 英語記事を日本語に翻訳・要約して読む負荷を下げる
- 重複記事を除去して情報密度を高める
- 結果を Markdown ファイルにまとめ、手元で斜め読みできる形にする

### ゴール（最終形）

Claude Code の TUI 上で `「今日の MCP と LangChain に関するニュースを取得して」` と自然言語で指示するだけで、ai-news-agent が内部でエージェンティックに情報収集・評価・整形を実行し、ダイジェスト md を生成する。

---

## 2. できること（スコープ）

### IN スコープ

- AI・LLM・エージェント・検索技術・MLOps に関するニュースの収集
- 複数ソース（RSS・Web 検索・技術ブログ）からの情報取得
- 重複記事の検出と除去
- 英語 → 日本語の翻訳と要約
- 重要度スコアリングと降順ソート
- Markdown ファイルへの出力
- MCP サーバーとして Claude Code / Codex CLI から呼び出し可能にする

### OUT スコープ（将来対応）

- X ブックマークの取り込み（API 制約のため Phase 4 以降）
- プッシュ通知・メール配信
- Web UI
- 過去記事との差分検出

---

## 3. アーキテクチャ概要

### 全体構造：二重エージェント（Mixture of Agents）

このシステムは **2 つのエージェントが階層的に動作する**構造をとる。

```
┌─────────────────────────────────────────────────────┐
│  外側エージェント：Claude Code（TUI）                 │
│                                                     │
│  ユーザーの自然言語指示を解釈し、                      │
│  「いつ・どのクエリで」fetch_ai_news を呼ぶかを判断    │
└───────────────────┬─────────────────────────────────┘
                    │ MCP tool call
                    ↓
┌─────────────────────────────────────────────────────┐
│  内側エージェント：ai-news-agent（MCP サーバー）       │
│                                                     │
│  ニュース収集に特化したエージェントループを実行         │
│  LLM（プランナー）が以下のツールを自律的に呼び出す      │
│                                                     │
│    ├─ fetchRSS        RSS フィードから記事取得         │
│    ├─ webSearch       Web 検索で最新情報を補完         │
│    ├─ checkDuplicate  embedding による重複判定         │
│    ├─ scoreArticle    LLM-as-judge で重要度評価       │
│    ├─ translate       英語 → 日本語翻訳               │
│    └─ writeMarkdown   md ファイル出力                 │
│                                                     │
│  十分な情報が集まったと判断したら md を返す             │
└─────────────────────────────────────────────────────┘
```

外側（Claude Code）は「何を・いつ頼むか」を担当し、内側（ai-news-agent）は「どうやって情報を集めて整形するか」を担当する。役割が明確に分離されている。

### 内側エージェントの処理フロー

```
[1] クエリ受信
    Claude Code から query・date・limit を受け取る

        ↓

[2] 情報収集（自律ループ）
    LLM がクエリを分析し、必要なソースと検索戦略を決定
    → fetchRSS / webSearch を組み合わせて実行
    → 情報が不足と判断したら追加検索（Multi-Query）

        ↓

[3] 正規化
    タイトル・URL・本文・日時・ソース名を統一フォーマットに変換

        ↓

[4] 重複除去
    checkDuplicate でコサイン類似度による重複を検出・統合

        ↓

[5] 重要度スコアリング
    scoreArticle（LLM-as-judge）が各記事を評価
    （技術的重要度・新規性・関心領域との関連度）

        ↓

[6] 翻訳・要約
    translate で英語記事を日本語に変換、3〜5 行の要約を生成

        ↓

[7] Markdown 出力
    writeMarkdown で重要度順に並べた md を生成し Claude Code に返す
```

### MCP サーバーのインターフェース

```typescript
// Claude Code から呼び出されるツール定義
server.tool("fetch_ai_news", {
  query: z.string(),    // 例: "MCPとLangChain"
  date:  z.string(),    // 例: "today" | "2026-03-10"
  limit: z.number(),    // 取得上限件数
}, async ({ query, date, limit }) => {
  const agent = new NewsAgent({ query, date, limit });
  const result = await agent.run(); // 内部エージェントループ実行
  return { content: [{ type: "text", text: result.markdown }] };
});
```

### Claude Code への登録

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "ai-news-agent": {
      "command": "node",
      "args": ["/path/to/ai-news-agent/dist/mcp-server.js"]
    }
  }
}
```

---

## 4. 出力フォーマット

```markdown
# AI ニュースダイジェスト — 2026-03-10

生成日時: 2026-03-10 07:00
クエリ: MCPとLangChain
記事数: 12 件（収集 34 件 → 重複除去後）

---

## ⭐⭐⭐ 重要度: 高

### 1. Anthropic、Claude 4 の Tool Use API を大幅アップデート
**ソース**: Anthropic Blog（英語）  
**URL**: https://...  
**日時**: 2026-03-09

**要約**  
Tool Use の並列呼び出し性能が向上し、複数ツールを同時実行できるようになった。
エージェント設計において待機時間が大幅に削減される。
RAG パイプラインとの統合にも直接影響する変更。

---

## ⭐⭐ 重要度: 中

### 2. ...

---

## ⭐ 重要度: 低・参考

### 10. ...
```

---

## 5. ロードマップ

### Phase 1 — MVP CLI（目安: 2〜3 週間）

**目標**: 動くものを最速で作る

- [ ] RSS フィード数本（Hacker News・Zenn・dev.to）から記事取得
- [ ] LLM による要約・翻訳（固定プロンプト）
- [ ] 重要度を High / Mid / Low の 3 段階でラベル付け
- [ ] `ai-news-agent "クエリ"` で `./output/YYYY-MM-DD.md` を生成

**判断基準**: 自分が実際に毎朝使えるレベルになっているか

---

### Phase 2 — 内側エージェント化（目安: Phase 1 完了から 3〜4 週間）

**目標**: 固定パイプラインをエージェントループに置き換える

- [ ] Tool use 設計（fetchRSS / webSearch / checkDuplicate / scoreArticle）
- [ ] LLM が不足情報を自律的に追加検索するループ実装（Multi-Query）
- [ ] embedding によるコサイン類似度を使った重複除去
- [ ] LLM-as-judge による重要度スコアリング

**学習価値**: Multi-Query・LLM-as-judge・embedding 重複除去は仕事の RAG 改善に直結する

---

### Phase 3 — MCP サーバー化・二重エージェント構造（目安: Phase 2 完了から 2〜3 週間）

**目標**: Claude Code / Codex CLI から自然言語で呼び出せる形にする

- [ ] ai-news-agent を MCP サーバーとして再実装（`@modelcontextprotocol/sdk` 使用）
- [ ] `fetch_ai_news` ツールの公開（query / date / limit インターフェース）
- [ ] `claude_desktop_config.json` への登録・Claude Code との疎通確認
- [ ] Claude Code の TUI から自然言語でニュース収集が完結することを確認

**得られる体験**: 「Claude Code が ai-news-agent を道具として使う」二重エージェント構造が動く状態

---

### Phase 4 — 拡張（目安: Phase 3 完了後、優先度に応じて）

**目標**: 自分のワークフローに完全統合する

- [ ] X ブックマークとの統合
- [ ] ソース追加（GitHub Trending / arXiv / 海外テックブログ）
- [ ] 過去ダイジェストとの差分検出（「先週から続いているトレンド」の検出）
- [ ] togu CLI との統合（`togu news` コマンドとして呼び出せる形）
- [ ] Zenn 記事執筆時のリサーチ入力として自動連携

---

## 6. 技術スタック（候補）

| 役割 | 候補 | 備考 |
|---|---|---|
| 言語 | TypeScript | togu と同スタック |
| LLM（内側エージェント） | Claude API（claude-sonnet-4-6） | Tool use サポート |
| MCP サーバー実装 | `@modelcontextprotocol/sdk` | 公式 TypeScript SDK |
| Web 検索 | Tavily API / Perplexity API | Phase 2 で検討 |
| RSS パース | `rss-parser` npm | Phase 1 から使用 |
| Embedding（重複除去） | Voyage AI / OpenAI embedding | Phase 2 で導入 |
| 出力 | fs（Node 標準） | md ファイル書き出し |

---

## 7. 成功基準

- **Phase 1**: 1 コマンドでその日のダイジェスト md が生成できる
- **Phase 2**: 重複記事が目視で明らかに減り、重要度順が体感で正しい
- **Phase 3**: Claude Code の TUI から自然言語でニュース収集が完結する
- **Phase 4**: 「X ブックマークを週 1 で見る」習慣が不要になる

---

## 8. ポートフォリオとしての価値

このプロジェクトは以下の観点で Zenn 記事・GitHub ポートフォリオになる。

- 二重エージェント構造の設計と実装（MoA: Mixture of Agents）
- MCP サーバーの自作経験（2026 年時点で差別化になる）
- LLM-as-judge による評価指標設計（仕事の RAG 評価と同じ構造）
- embedding を使った重複除去（RAG のチャンク品質管理と同じ技術）
- TypeScript での CLI → MCP サーバー移行の設計判断

Helpfeel・Stockmark の面接軸「評価インフラの設計経験」および「エージェント設計経験」に直結する実装になる。
