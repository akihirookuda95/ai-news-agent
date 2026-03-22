# Phase 1 実装メモ

## ゴール

`ai-news-agent "クエリ" --limit 10` の1コマンドで `./output/YYYY-MM-DD.md` を生成する。

---

## Phase 1 スケジュール（Week 1: 3/22 土 - 3/23 日、土日合わせて約8h）

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
    importance: "high" | "medium" | "low"; // 後でLLMが埋める
  }
  ```

**確認ポイント**: `npx tsx src/index.ts` でHN記事一覧がコンソールに表示される

---

### Day 2 — 複数ソース対応 + クエリフィルタリング

**目標**: Hacker News / Zenn / dev.to の3ソースから記事を取得し、クエリで絞り込める状態

- [ ] `fetchRSS` 関数を汎用化（URLを渡すだけで動く形に）
- [ ] Zenn RSS（`https://zenn.dev/feed`）を追加
- [ ] dev.to RSS（`https://dev.to/feed`）を追加
- [ ] CLI引数でクエリと`--limit`オプションを受け取る（例: `ai-news-agent "MCP" --limit 10`）
- [ ] タイトル・本文にクエリキーワードが含まれる記事をフィルタリング

**RSSフィードURL**:
| ソース | URL |
|---|---|
| Hacker News | `https://news.ycombinator.com/rss` |
| Zenn | `https://zenn.dev/feed` |
| dev.to | `https://dev.to/feed` |

**確認ポイント**: `npx tsx src/index.ts "MCP"` でMCP関連記事だけが絞り込まれて表示される

---

### Day 3 — Claude API連携（完全翻訳・重要度分類）

**目標**: 各記事をClaude APIで日本語完全翻訳 + High/Mid/Low分類できる状態

- [ ] `@anthropic-ai/sdk` を導入、APIキーを `.env` に設定
- [ ] `translateArticle` 関数を実装（固定プロンプトで完全翻訳・重要度を一括取得）
  - 1回のAPI呼び出しで翻訳・重要度を返すプロンプト設計
  - レスポンスはJSON形式で受け取ると後処理が楽
- [ ] 全記事にtranslateを適用（並列処理で高速化: `Promise.allSettled`）
- [ ] レート制限対策として適度なconcurrency制御（同時5件程度）

**プロンプト設計メモ**:
```
以下の記事を日本語に完全翻訳し、技術的重要度をhigh/medium/lowで判定してください。
翻訳は要約ではなく原文の内容をすべて翻訳すること。技術用語（embedding, RAG等）は英語のまま保持。
JSONで返してください: { "translation": "...", "importance": "high"|"medium"|"low" }

タイトル: {title}
本文: {content}
```

**確認ポイント**: 各記事に日本語完全翻訳と重要度ラベルが付いた状態でコンソールに表示される

---

### Day 4 — Markdown出力 + CLI完成 + 動作確認

**目標**: `ai-news-agent "クエリ" --limit 10` で `./output/YYYY-MM-DD.md` が生成される

- [ ] `writeMarkdown` 関数を実装
  - High / Mid / Low でセクション分け
  - 各記事: タイトル・ソース・URL・日時・翻訳を出力
  - ヘッダーに生成日時・クエリ・記事数を記載
- [ ] `./output/` ディレクトリを自動作成
- [ ] `package.json` に `bin` エントリを追加してCLIコマンドとして呼べるようにする
- [ ] 全体を通しで動作確認
- [ ] パフォーマンス計測（5記事で2分以内、10記事で3分以内を目標）
- [ ] README.md に使い方を書く（セットアップ手順・実行例）

**確認ポイント**: `ai-news-agent "LLM" --limit 10` で仕様書通りの md が生成される。5記事で2分以内、10記事で3分以内を達成していること

---

## ファイル構成（Phase 1 想定）

```
ai-news-agent/
├── src/
│   ├── index.ts                    # エントリーポイント（CLI引数処理）
│   ├── types.ts                    # 共通型定義（Article等）
│   ├── services/
│   │   ├── fetchRSS.ts             # RSS取得
│   │   ├── translate.ts            # Claude API連携（完全翻訳・重要度）
│   │   └── writeMarkdown.ts        # md出力
│   └── use-cases/
│       └── collectNews.ts          # フロー制御（fetchRSS → translate → write）
├── output/                         # 生成されたmdファイルの置き場
├── .env                            # ANTHROPIC_API_KEY
├── package.json
└── tsconfig.json
```

---

## 参考リンク

- Anthropic SDK: https://docs.anthropic.com/
- rss-parser: https://www.npmjs.com/package/rss-parser
- MCP仕様（Phase 3で使う）: https://modelcontextprotocol.io/
