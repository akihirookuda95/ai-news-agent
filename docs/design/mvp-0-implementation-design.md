# MVP-0 Implementation Design

作成日: 2026-05-04

## 目的

`ai-news-agent` MVP-0 の実装に入る前に、実装時に迷いやすい詳細設計を決定ログとして記録する。

この文書は、`docs/design/mvp-requirements.md` を前提に、MVP-0 実装に必要な判断をテーマごとに追記していく。

## 前提

MVP-0 の source of truth は次の文書である。

- `docs/design/product-vision-and-mvp-direction.md`
- `docs/design/mvp-requirements.md`

この文書では、MVP-0 の scope を広げる判断は行わない。

MVP-0 では、OpenAI / Anthropic / LangChain / LangGraph の公式ブログだけを対象 source とし、URL 重複除去、本文翻訳、Markdown research brief 生成までを扱う。

GitHub Releases / changelog、公式ドキュメント更新、Hacker News、Reddit、X、Zenn、Qiita、dev.to、通知、音声、hosted DB、定期実行、深い自律探索、relevance score、importance score は対象外とする。

## 決定ログ

### 1. source adapter と official_blog_worker の責務境界

#### 決定

source adapter は、source 固有の取得、抽出、最低限の正規化までを担当する。

`official_blog_worker` は、複数 adapter の実行、`SourceRunResult` への集約、失敗整理だけを担当する。

#### 責務分担

source adapter の責務:

- source 名を持つ。
- 記事一覧を取得する。
- metadata を抽出する。
- 本文を取得・抽出する。
- `CandidateItem` 相当の素材を返す。
- source 固有の失敗理由を返す。

`official_blog_worker` の責務:

- OpenAI / Anthropic / LangChain / LangGraph adapter を並列実行する。
- adapter 結果を `SourceRunResult[]` にまとめる。
- source ごとの `fetchedCount` / `candidateCount` / `status` / `failureReason` を整理する。
- manager に返せる形にする。

#### 理由

OpenAI / Anthropic / LangChain / LangGraph は、取得方法や HTML 構造が異なる可能性が高い。

source 固有の差分を adapter に閉じ込めることで、`official_blog_worker` を薄く保てる。

#### MVP-0 に必要な理由

MVP-0 でも公式ブログが 4 つあるため、取得差分をどこに置くかを決めないと実装が壊れやすい。

#### 壊れやすい場所

- 各ブログの一覧ページ
- RSS / sitemap / HTML の有無
- 本文 HTML 構造
- source ごとの metadata 欠落

#### 後から source を追加する場合の変更箇所

新しい source adapter を追加し、`official_blog_worker` の adapter 一覧に登録する。

`CandidateItem` / `SourceRunResult` の共通 schema は変えない。

#### 後回しにするもの

- adapter の自動発見
- source ごとの child worker 化
- 高度な fallback
- LLM による本文抽出補正

### 2. contentRef の実体と本文保存方式

#### 決定

MVP-0 の `contentRef` は、抽出済み記事本文を保存したローカル Markdown ファイルへの参照パスにする。

記事本文はローカル Markdown ファイルとして保存する。

`CandidateItem` には記事本文全文を入れず、本文ファイルへの参照である `contentRef` だけを入れる。

#### 想定パス

```text
output/content/{runId}/{candidateId}.md
```

例:

```text
output/content/run-20260504-120000/openai-001.md
```

#### CandidateItem 例

```ts
type CandidateItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: "official_blog";
  publishedAt?: string;
  summary?: string;
  contentRef?: string;
  status: "ready" | "extraction_failed" | "skipped";
  failureReason?: string;
};
```

#### 処理の流れ

```text
1. source adapter が記事本文を取得する
2. source adapter が本文を output/content/{runId}/{candidateId}.md に保存する
3. CandidateItem には contentRef だけを入れる
4. manager は CandidateItem の metadata を見て判断する
5. translation layer は contentRef から本文を読む
6. output layer は CandidateItem と TranslationResult を組み合わせて research brief を作る
```

#### 理由

MVP-0 で必要なのは、本文を後段の translation layer / output layer が読めることである。

本文を shared state に直接載せると、manager が判断に使わない長文まで抱えることになり、責務が混ざる。

ローカル Markdown ファイルに保存すれば、人間が中身を確認しやすく、失敗時のデバッグもしやすい。

#### DB 保存をしない理由

MVP-0 の scope に hosted DB は含めない。

DB を導入すると、schema、migration、接続設定、永続化エラー処理が増える。

これは MVP-0 で検証したい「公式ブログから本文を取得し、翻訳し、読みやすい Markdown research brief を生成できるか」に直接効かない。

#### MVP-0 に必要な理由

manager 用 shared state と、翻訳・出力に必要な本文データを分離できる。

translation layer と output layer は `contentRef` から本文を読めばよいため、`CandidateItem` を長文化せずに済む。

#### 壊れやすい場所

- `candidateId` の生成
- ファイル名に使えない文字の除去
- 抽出途中で失敗した場合の `contentRef` 未設定
- 途中失敗時の残ファイル

#### 後から source を追加する場合の変更箇所

基本的には変更しない。

新しい adapter が本文を保存し、`contentRef` を返す契約を守ればよい。

#### 後から DB 化する場合

`contentRef` は「本文の場所を指す」という契約を維持する。

将来 DB 化する場合は、参照形式を差し替える。

```ts
// MVP-0
contentRef: "output/content/run-001/openai-001.md"

// 将来
contentRef: "db://article_contents/openai-001"
```

manager は `contentRef` の実体を知らなくてよい。

#### 後回しにするもの

- DB 保存
- hosted DB
- cache
- 同一 URL の永続重複管理
- content store の抽象化

### 3. Markdown research brief の出力先と命名規則

#### 決定

MVP-0 の記事本文ファイルと最終 research brief は、同じ `runId` 配下で対応付けられる形にする。

記事本文:

```text
output/content/{runId}/{candidateId}.md
```

最終 research brief:

```text
output/briefs/{runId}/ai-research-brief.md
```

`runId` は実行ごとに一意な値にする。

例:

```text
run-20260504-120000
```

#### 理由

同じ日に複数回実行しても、最終 research brief や記事本文ファイルが上書きされない。

`runId` で記事本文と最終 research brief を対応付けられるため、失敗時や出力確認時に追いやすい。

将来、run log や source ごとの実行結果ファイルを追加する場合も、同じ `runId` 配下にまとめやすい。

#### MVP-0 に必要な理由

MVP-0 では Markdown research brief が最終成果物であり、記事本文ファイルは translation / output layer が参照する中間成果物である。

両者の保存先と対応関係を固定しておくことで、実装時に output layer と debug 導線がぶれにくい。

#### 壊れやすい場所

- `runId` の生成形式
- 同一 `runId` の衝突
- 実行途中で失敗した場合の中間ファイル
- 出力ディレクトリ作成漏れ

#### 後から source を追加する場合の変更箇所

基本的には変更しない。

新しい source adapter が `output/content/{runId}/{candidateId}.md` に本文を保存し、`contentRef` を返す契約を守ればよい。

最終 research brief 側は、source セクションまたは source 表示を追加するだけで対応できる。

#### 後回しにするもの

- 日付単位の index ファイル
- 実行履歴一覧
- run log の別ファイル保存
- 古い出力の自動削除
- 出力ファイル名の user query 反映

### 4. MVP-0 の実装技術と初期 scaffold

#### 決定

MVP-0 は TypeScript + Node.js + LangGraph.js で実装する。

LangGraph.js は orchestration に限定して使う。

source adapter、本文保存、URL dedupe、translation、Markdown output などの business logic は通常の TypeScript module として分離する。

MCP server は MVP-0 では導入しない。

#### 採用するもの

- TypeScript
- Node.js
- LangGraph.js
- `tsx` による開発実行

#### MVP-0 では導入しないもの

- MCP server
- 自律的 tool-calling agent
- hosted execution
- scheduler
- hosted DB

#### 理由

MVP-0 は `manager / worker / dedupe / translation / output / shared state` を持つ controlled workflow である。

そのため、実行順序、node 境界、shared state 更新を LangGraph.js の `StateGraph` として表現しやすい。

素の TypeScript だけで manager に手続き的な orchestration を書くより、最初から graph と node に分けるほうが、後から source、retry、partial failure、checkpoint を追加しやすい。

一方で、LangGraph.js が減らすのは orchestration の複雑さであり、source 固有の取得、本文抽出、翻訳、Markdown 出力の実装量そのものではない。

そのため、LangGraph.js の node には薄い orchestration を置き、実処理は通常 module に分離する。

#### MCP server を後回しにする理由

MCP server は外部から `ai-news-agent` を呼び出すための interface であり、MVP-0 の中核である公式ブログ取得、本文抽出、翻訳、Markdown research brief 生成の品質検証には直接効きにくい。

MVP-0 では、まず graph 実行関数として end-to-end に動く状態を作る。

将来 MCP server 化する場合は、MCP tool から graph 実行関数を呼ぶ形にする。

#### 初期 scaffold

```text
src/
  index.ts
  graph/
    mvp0-graph.ts
    state.ts
    nodes/
      collect-official-blogs.ts
      dedupe-urls.ts
      translate-items.ts
      write-brief.ts
  sources/
    official-blogs/
      openai-adapter.ts
      anthropic-adapter.ts
      langchain-adapter.ts
      langgraph-adapter.ts
  workers/
    official-blog-worker.ts
  dedupe/
    url-dedupe.ts
  translation/
    translator.ts
  output/
    markdown-brief.ts
  storage/
    content-store.ts
  core/
    types.ts
    run-id.ts
```

#### module 責務

`src/index.ts`:

- MVP-0 の実行入口。
- `runId` を生成し、LangGraph graph を実行する。

`src/graph/mvp0-graph.ts`:

- MVP-0 の `StateGraph` を定義する。
- node と edge を接続する。

`src/graph/state.ts`:

- LangGraph で扱う shared state schema を定義する。

`src/graph/nodes/*`:

- graph node の薄い wrapper。
- 実処理は `workers` / `dedupe` / `translation` / `output` module に委譲する。

`src/workers/official-blog-worker.ts`:

- OpenAI / Anthropic / LangChain / LangGraph adapter を並列実行する。
- `SourceRunResult[]` に集約する。

`src/sources/official-blogs/*`:

- source 固有の一覧取得、metadata 抽出、本文抽出、contentRef 保存を行う。

`src/storage/content-store.ts`:

- `output/content/{runId}/{candidateId}.md` への保存を行う。
- `contentRef` から本文を読む。

`src/dedupe/url-dedupe.ts`:

- 同一 URL の重複除去だけを行う。

`src/translation/translator.ts`:

- `contentRef` から本文を読み、翻訳して `TranslationResult` を返す。

`src/output/markdown-brief.ts`:

- `output/briefs/{runId}/ai-research-brief.md` を生成する。

`src/core/types.ts`:

- `CandidateItem`
- `SourceRunResult`
- `TranslationResult`
- `BriefRunResult`
- その他 MVP-0 共通型

`src/core/run-id.ts`:

- 実行ごとの `runId` を生成する。

#### MVP-0 に必要な理由

MVP-0 でも controlled multi-agent の責務境界を検証したい。

LangGraph.js を使うことで、manager 的な orchestration を graph と node と shared state として明示できる。

同時に、source adapter や output などは通常 module として分けるため、単体テストしやすく、MCP server 化前にも保守しやすい。

#### 壊れやすい場所

- LangGraph.js の state schema 設計
- node が太り、business logic を抱え込むこと
- graph と通常 module の責務境界が曖昧になること
- LangGraph.js の API 変更

#### 後から source を追加する場合の変更箇所

新しい source adapter を `src/sources/official-blogs/` に追加する。

`official-blog-worker.ts` の adapter 一覧に登録する。

graph の node 構成や shared state schema は基本的に変えない。

#### 後から MCP server 化する場合の変更箇所

MCP server module を追加し、tool handler から MVP-0 graph 実行関数を呼び出す。

graph、adapter、translation、output の既存 module は大きく変えない。

#### 後回しにするもの

- MCP server
- LangGraph checkpoint
- human-in-the-loop
- retry policy の高度化
- graph visualization
- hosted execution

## 次に決めること

1. 公式ブログ source ごとの取得方法
