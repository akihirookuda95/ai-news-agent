# AI ニュース収集エージェント 仕様書

**プロジェクト名**: ai-news-agent  
**作成日**: 2026-03-10  
**更新日**: 2026-03-12  
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
- **毎日・毎週、一定の量と品質のニュースを安定して提供する**

### ゴール（最終形）

Claude Code の TUI 上で対話的に情報ニーズを明確にし、その結果を元に ai-news-agent が内部でエージェンティックに情報収集・評価・整形を実行し、ダイジェスト md を生成する。

**例**:
```
> 今日はどんな情報が欲しいですか？
→ 仕事に直結するライブラリの更新情報が欲しい

> 最近使っているライブラリを教えてください
→ LangGraph, Cohere, Elasticsearch

> 更新情報のみ、それとも使い方の記事も？
→ 更新情報のみ

→ [ai-news-agent 起動 → 公式docs・GitHub Releases から情報収集 → md 生成]
```

---

## 2. できること（スコープ）

### IN スコープ

- AI・LLM・エージェント・検索技術・MLOps に関するニュースの収集
- 複数ソース（RSS・Web 検索・技術ブログ・公式ドキュメント）からの情報取得
- **固定ソース → フォールバック追加ソース、の多段フェッチ戦略**
- **TUI 対話による情報ニーズの明確化（抽象度・ジャンル・対象ライブラリ等）**
- **抽象度レイヤーに応じた動的なソース選択**
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

## 3. 情報抽象度レイヤー設計

ユーザーがその日知りたい情報の「粒度」によって、参照するソースと収集戦略が変わる。

| レイヤー | 目的 | 主なソース |
|---|---|---|
| **マクロ**（世界の大きな流れ） | AI 業界全体のトレンド・規制・企業動向を把握 | TechCrunch, Wired, Reuters, The Verge |
| **ミドル**（ツール・コミュニティ動向） | 新 AI ツールのローンチ、OSS の話題、実装トレンド | Zenn, Qiita, Hacker News, dev.to |
| **ミクロ**（仕事直結情報） | 使用ライブラリの更新・API 変更・バグ修正 | 公式 Docs, GitHub Releases, Changelog |

TUI 対話でユーザーが示した意図から抽象度レイヤーを判定し、対応するソース群を選択する。

---

## 4. フォールバック付き多段フェッチ戦略

固定ソースから取得した情報が「量・質」の基準を満たさない場合、追加ソースへ段階的にフォールバックする。これにより毎日・毎週、安定した量と品質のダイジェストを生成できる。

```
[Step 1] 固定ソース取得（Zenn, Qiita, Hacker News など）
         ↓
         品質・量チェック（LLM-as-judge）
         ┌─ 十分 → [Step 5] へ
         └─ 不足 ↓

[Step 2] 抽象度レイヤーに対応する追加ソース取得（Web 検索など）
         ↓
         品質・量チェック
         ┌─ 十分 → [Step 5] へ
         └─ 不足 ↓

[Step 3] さらに広範なソースを追加（Multi-Query 展開）
         ↓
         品質・量チェック
         ┌─ 十分 → [Step 5] へ
         └─ n 段階まで繰り返し

[Step 5] 最終フィルタリング・整形 → md 生成
```

**品質・量の判断基準（内側エージェントが担当）**:
- 記事数が `limit` に対して著しく不足していないか
- スコアリングで「高・中」評価の記事が一定数あるか
- ソースの多様性（同一サイトに偏っていないか）

---

## 5. TUI 対話フェーズ設計

実行前に Claude Code（外側エージェント）がユーザーと対話し、情報ニーズを明確にする。

### 対話の流れ

```
今日はどんな情報が欲しいですか？
  → [自由入力]

（入力に応じて追加質問を動的に生成）
例:
  ・「仕事直結」と入力した場合 → 使用ライブラリ・フレームワークを確認
  ・「世界の流れ」と入力した場合 → 特定トピックに絞るか確認
  ・「新ツール」と入力した場合 → 言語・領域の絞り込みを確認

取得件数の目安は？（デフォルト: 10件）
  → [入力またはスキップ]

確認: [要約された情報ニーズ]でよいですか？
  → [Yes / 修正]
```

### 対話結果の渡し方

対話で得た情報を構造化して内側エージェントに渡す：

```typescript
interface NewsRequest {
  query: string;           // 例: "LangGraph Cohere Elasticsearch 更新情報"
  abstractionLayer: "macro" | "middle" | "micro";
  targetSources?: string[];// 例: ["github_releases", "official_docs"]
  date: string;            // 例: "today"
  limit: number;           // 例: 10
  userIntent: string;      // 対話の要約（LLM 用コンテキスト）
}
```

---

## 6. アーキテクチャ概要

### 全体構造：二重エージェント（Mixture of Agents）

```
┌─────────────────────────────────────────────────────┐
│  外側エージェント：Claude Code（TUI）                 │
│                                                     │
│  ① ユーザーと対話し情報ニーズを明確化                 │
│  ② NewsRequest を構築し fetch_ai_news を呼び出す      │
│  ③ 結果の md を表示する                              │
└───────────────────┬─────────────────────────────────┘
                    │ MCP tool call（NewsRequest）
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
│    │                  ＋ フォールバック判断            │
│    ├─ translate       英語 → 日本語翻訳               │
│    └─ writeMarkdown   md ファイル出力                 │
│                                                     │
│  品質・量が基準を満たすまでフォールバックループを実行   │
│  十分な情報が集まったと判断したら md を返す             │
└─────────────────────────────────────────────────────┘
```

### 内側エージェントの処理フロー

```
[1] リクエスト受信
    外側から NewsRequest（query / abstractionLayer / limit 等）を受け取る

        ↓

[2] ソース選択
    abstractionLayer に基づき固定ソース群を決定

        ↓

[3] 情報収集（フォールバックループ）
    fetchRSS / webSearch を実行
    → scoreArticle で品質・量を評価
    → 不足なら追加ソースで再取得（Multi-Query）
    → n 段階まで繰り返す

        ↓

[4] 正規化
    タイトル・URL・本文・日時・ソース名を統一フォーマットに変換

        ↓

[5] 重複除去
    checkDuplicate でコサイン類似度による重複を検出・統合

        ↓

[6] 重要度スコアリング
    scoreArticle（LLM-as-judge）が各記事を評価
    （技術的重要度・新規性・関心領域との関連度）

        ↓

[7] 翻訳・要約
    translate で英語記事を日本語に変換、3〜5 行の要約を生成

        ↓

[8] Markdown 出力
    writeMarkdown で重要度順に並べた md を生成し Claude Code に返す
```

### MCP サーバーのインターフェース

```typescript
server.tool("fetch_ai_news", {
  query: z.string(),
  abstractionLayer: z.enum(["macro", "middle", "micro"]),
  targetSources: z.array(z.string()).optional(),
  date: z.string(),
  limit: z.number(),
  userIntent: z.string(),
}, async (request) => {
  const agent = new NewsAgent(request);
  const result = await agent.run();
  return { content: [{ type: "text", text: result.markdown }] };
});
```

### Claude Code への登録

```json
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

## 7. 出力フォーマット

```markdown
# AI ニュースダイジェスト — 2026-03-10

生成日時: 2026-03-10 07:00
クエリ: LangGraph / Cohere / Elasticsearch 更新情報
抽象度: ミクロ（仕事直結）
記事数: 10 件（収集 28 件 → 重複除去後）

---

## ⭐⭐⭐ 重要度: 高

### 1. LangGraph v0.3.0 リリース — ストリーミング対応が強化
**ソース**: GitHub Releases（英語）  
**URL**: https://...  
**日時**: 2026-03-09

**要約**  
ストリーミング出力の安定性が改善され、長時間実行のエージェントループで
タイムアウトが発生しにくくなった。
既存コードへの破壊的変更はなし。

---

## ⭐⭐ 重要度: 中

### 2. ...

---

## ⭐ 重要度: 低・参考

### 8. ...
```

---

## 8. ロードマップ

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
- [ ] **フォールバック付き多段フェッチループの実装**
- [ ] **抽象度レイヤーに応じたソース選択ロジック**
- [ ] LLM が不足情報を自律的に追加検索するループ実装（Multi-Query）
- [ ] embedding によるコサイン類似度を使った重複除去
- [ ] LLM-as-judge による重要度スコアリング・品質評価

**学習価値**: Multi-Query・LLM-as-judge・embedding 重複除去は仕事の RAG 改善に直結する

---

### Phase 3 — MCP サーバー化・二重エージェント構造（目安: Phase 2 完了から 2〜3 週間）

**目標**: Claude Code の TUI 上で対話から md 生成まで完結させる

- [ ] ai-news-agent を MCP サーバーとして再実装（`@modelcontextprotocol/sdk` 使用）
- [ ] `fetch_ai_news` ツールの公開（NewsRequest インターフェース）
- [ ] **TUI 対話フェーズの実装（Claude Code 側）**
- [ ] **abstractionLayer の判定ロジック実装**
- [ ] `claude_desktop_config.json` への登録・Claude Code との疎通確認
- [ ] Claude Code の TUI から対話 → ニュース収集 → md 生成が完結することを確認

---

### Phase 4 — 拡張（目安: Phase 3 完了後、優先度に応じて）

**目標**: 自分のワークフローに完全統合する

- [ ] X ブックマークとの統合
- [ ] ソース追加（GitHub Trending / arXiv / 海外テックブログ）
- [ ] 過去ダイジェストとの差分検出（「先週から続いているトレンド」の検出）
- [ ] Zenn 記事執筆時のリサーチ入力として自動連携

---

## 9. 技術スタック（候補）

| 役割 | 候補 | 備考 |
|---|---|---|
| 言語 | TypeScript | |
| LLM（内側エージェント） | Claude API（claude-sonnet-4-6） | Tool use サポート |
| MCP サーバー実装 | `@modelcontextprotocol/sdk` | 公式 TypeScript SDK |
| Web 検索 | Tavily API / Perplexity API | Phase 2 で検討 |
| RSS パース | `rss-parser` npm | Phase 1 から使用 |
| Embedding（重複除去） | Voyage AI / OpenAI embedding | Phase 2 で導入 |
| 出力 | fs（Node 標準） | md ファイル書き出し |

---

## 10. 成功基準

- **Phase 1**: 1 コマンドでその日のダイジェスト md が生成できる
- **Phase 2**: 重複記事が目視で明らかに減り、重要度順が体感で正しい。量・質が不足した日もフォールバックで補完されている
- **Phase 3**: TUI 上で対話 → 情報ニーズ明確化 → ニュース収集 → md 生成が完結する
- **Phase 4**: 「X ブックマークを週 1 で見る」習慣が不要になる

---

## 11. ポートフォリオとしての価値

- 二重エージェント構造の設計と実装（MoA: Mixture of Agents）
- MCP サーバーの自作経験（2026 年時点で差別化になる）
- LLM-as-judge による評価指標設計（仕事の RAG 評価と同じ構造）
- embedding を使った重複除去（RAG のチャンク品質管理と同じ技術）
- **フォールバック戦略を持つ品質保証ループの設計**
- **TUI 対話 → 動的ソース選択 → エージェント実行の E2E 設計**
- TypeScript での CLI → MCP サーバー移行の設計判断

Helpfeel・Stockmark の面接軸「評価インフラの設計経験」および「エージェント設計経験」に直結する実装になる。
