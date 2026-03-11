# Phase 1 実装メモ

## ゴール

`ai-news-agent "クエリ"` の1コマンドで `./output/YYYY-MM-DD.md` を生成する。

---

## Phase 1 スケジュール（2h/日 × 4日）

### Day 1 — プロジェクト初期セットアップ + RSS取得

**目標**: `rss-parser` でHacker NewsのRSSを取得してコンソールに出力できる状態

- [ ] `npm init -y` + TypeScript環境を整える（`tsconfig.json`, `ts-node` or `tsx`）
- [ ] `.env` 管理のため `dotenv` を導入（後でClaude APIキーを入れる準備）
- [ ] `rss-parser` を導入し、Hacker News RSSを取得・パース
- [ ] 記事の統一フォーマット型を定義する
  ```typescript
  type Article = {
    title: string;
    url: string;
    summary: string;   // 後でLLMが埋める
    source: string;
    publishedAt: string;
    importance: "high" | "mid" | "low"; // 後でLLMが埋める
  }
  ```

**確認ポイント**: `npx tsx src/index.ts` でHN記事一覧がコンソールに表示される

---

### Day 2 — 複数ソース対応 + クエリフィルタリング

**目標**: Hacker News / Zenn / dev.to の3ソースから記事を取得し、クエリで絞り込める状態

- [ ] `fetchRSS` 関数を汎用化（URLを渡すだけで動く形に）
- [ ] Zenn RSS（`https://zenn.dev/feed`）を追加
- [ ] dev.to RSS（`https://dev.to/feed`）を追加
- [ ] CLI引数でクエリを受け取る（`process.argv[2]`）
- [ ] タイトル・本文にクエリキーワードが含まれる記事をフィルタリング

**RSSフィードURL**:
| ソース | URL |
|---|---|
| Hacker News | `https://news.ycombinator.com/rss` |
| Zenn | `https://zenn.dev/feed` |
| dev.to | `https://dev.to/feed` |

**確認ポイント**: `npx tsx src/index.ts "MCP"` でMCP関連記事だけが絞り込まれて表示される

---

### Day 3 — Claude API連携（翻訳・要約・重要度分類）

**目標**: 各記事をClaude APIで日本語要約 + High/Mid/Low分類できる状態

- [ ] `@anthropic-ai/sdk` を導入、APIキーを `.env` に設定
- [ ] `summarizeArticle` 関数を実装（固定プロンプトで要約・翻訳・重要度を一括取得）
  - 1回のAPI呼び出しで要約・翻訳・重要度を返すプロンプト設計
  - レスポンスはJSON形式で受け取ると後処理が楽
- [ ] 全記事にsummarizeを適用（並列処理で高速化: `Promise.all`）
- [ ] レート制限対策として適度なconcurrency制御（同時5件程度）

**プロンプト設計メモ**:
```
以下の記事を日本語で3〜5行に要約し、技術的重要度をhigh/mid/lowで判定してください。
JSONで返してください: { "summary": "...", "importance": "high"|"mid"|"low" }

タイトル: {title}
本文: {content}
```

**確認ポイント**: 各記事に日本語要約と重要度ラベルが付いた状態でコンソールに表示される

---

### Day 4 — Markdown出力 + CLI完成 + 動作確認

**目標**: `ai-news-agent "クエリ"` で `./output/YYYY-MM-DD.md` が生成される

- [ ] `writeMarkdown` 関数を実装
  - High / Mid / Low でセクション分け
  - 各記事: タイトル・ソース・URL・日時・要約を出力
  - ヘッダーに生成日時・クエリ・記事数を記載
- [ ] `./output/` ディレクトリを自動作成
- [ ] `package.json` に `bin` エントリを追加してCLIコマンドとして呼べるようにする
- [ ] 全体を通しで動作確認
- [ ] README.md に使い方を書く（セットアップ手順・実行例）

**確認ポイント**: `npx ai-news-agent "LLM"` または `npm start "LLM"` で仕様書通りのmdが生成される

---

## ファイル構成（Phase 1 想定）

```
ai-news-agent/
├── src/
│   ├── index.ts          # エントリーポイント（CLI引数処理）
│   ├── fetchRSS.ts       # RSS取得・フィルタリング
│   ├── summarize.ts      # Claude API連携（要約・翻訳・重要度）
│   └── writeMarkdown.ts  # md出力
├── output/               # 生成されたmdファイルの置き場
├── .env                  # ANTHROPIC_API_KEY
├── package.json
└── tsconfig.json
```

---

## 参考リンク

- Anthropic SDK: https://docs.anthropic.com/
- rss-parser: https://www.npmjs.com/package/rss-parser
- MCP仕様（Phase 3で使う）: https://modelcontextprotocol.io/
