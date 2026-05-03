# 最小マルチエージェント設計の決定事項

作成日: 2026-04-26

## 目的

`ai-news-agent` の最小マルチエージェント構成について、議論で確定した内容を記録する。

この文書は、次の文書を前提にした決定ログである。

- `docs/design/current-discussion-points.md`
- `docs/design/discussion-rules.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`

## 1. Manager の責務

### 今回の論点

manager agent が持つ責務と、worker / judge / translation / output に任せる責務の境界を決める。

### 決定事項

manager は **薄い orchestrator** として設計する。

manager は実作業を持たず、次の責務を担う。

- `NewsRequest` を受け取る。
- 初期探索計画を作る。
- source worker に処理を委譲する。
- shared state と judge 結果を確認する。
- 追加探索の要否を判断する。
- 停止条件を判定する。
- 翻訳対象を確定する。
- 成功 / 部分成功 / 失敗の最終状態を確定する。

manager は次の責務を持たない。

- RSS / GitHub / Hacker News などの fetch。
- HTML 本文抽出。
- normalization の実処理。
- dedupe の実処理。
- ranking score の算出。
- 完全翻訳。
- Markdown 書き出し。

### 採らなかった選択肢

#### 案 B: 判断強めの manager

manager が judge 結果の最終調整や記事順序の調整まで持つ案。

採用しない理由:

- manager と judge / ranking の責務境界が曖昧になる。
- 最終調整に LLM 呼び出しが増える可能性がある。
- 記事順序の判断根拠が manager 側に分散しやすい。

#### 案 C: 太い manager

manager が orchestration に加えて、ranking / dedupe / output 構成の多くまで直接担う案。

採用しない理由:

- manager に実処理が集まり、source worker / judge / output の責務が弱くなる。
- 候補数が増えた場合に context が肥大化しやすい。
- 失敗時に、どの処理段階で失敗したか追いにくくなる。
- source や translation QA を後から追加しにくくなる。

### 採用理由

- LangGraph の supervisor pattern と整合する。
- manager の責務を計画、委譲、進行管理、停止判定、最終状態確定に絞れる。
- source worker、judge、translation、output の責務境界を明確にできる。
- agent 間の受け渡しを structured shared state に寄せやすい。
- source worker や translation を並列化しやすく、性能目標に合わせやすい。
- 後から source、judge、translation QA、MCP 接続を追加しやすい。

### 未決事項

- manager が worker に渡す input schema。
- manager が読む shared state schema。
- 停止条件の具体値。
- 追加探索のトリガー条件。
- 部分成功 / 失敗の判定条件。
- manager の実装に LangGraph.js を使うか、素の TypeScript で始めるか。

### 実装への影響

- manager の実装は、個別処理の中身ではなく orchestration に集中させる。
- fetch、本文抽出、normalization は source worker / source adapter 側へ分離する。
- dedupe と ranking score の算出は judge / ranking layer 側へ分離する。
- translation と Markdown 書き出しはそれぞれ別 layer として扱う。
- manager は shared state と judge 結果を読んで、次の action を決める形にする。

## 2. Source Worker の最小構成

### 今回の論点

MVP で source worker をどの粒度に分けるかを決める。

### 決定事項

source worker は **ソース種別ごとに細かく分ける案** を採用する。

MVP では、次の source worker を持つ。

- `official_blog_worker`
- `github_release_worker`
- `docs_update_worker`
- `hacker_news_worker`

各 worker は担当ソースの候補収集を行い、後続の judge / dedupe が扱える共通形式で結果を返す。

各 worker は並列実行できる前提で設計する。

Hacker News は補助ソースとして扱い、一次情報の代替にはしない。

### official_blog_worker の扱い

`official_blog_worker` は、複数の公式ブログ source adapter を内部に持てる設計にする。

想定例:

- OpenAI blog adapter
- Anthropic blog adapter
- LangChain blog adapter
- Cohere blog adapter
- LlamaIndex blog adapter
- Chroma blog adapter
- Elastic blog adapter

ただし、MVP では最初から child worker 化しない。

まずは `official_blog_worker` の内部に source adapter を複数持たせ、adapter 単位で成功 / 失敗ログを残せるようにする。

将来的に source ごとの差異が大きくなった場合は、adapter を child worker に昇格できる余地を残す。

child worker への昇格条件:

- source ごとに retry / timeout / fallback が大きく異なる。
- source ごとの extraction / normalization が複雑化する。
- source ごとの成功 / 失敗を manager が直接判断したくなる。
- `official_blog_worker` が他 worker より明らかに太る。

### 採らなかった選択肢

#### 案 B: 公式系をまとめる構成

公式ブログと公式ドキュメント更新をまとめた `official_source_worker` を置き、worker 数を減らす案。

採用しない理由:

- 公式ブログと公式ドキュメント更新では取得方法や更新粒度が異なる。
- `official_source_worker` が太りやすい。
- 公式ブログだけ失敗したのか、公式ドキュメント更新だけ失敗したのかを切り分けにくくなる。

#### 案 C: generic source worker にまとめる構成

すべての source を 1 つの `source_worker` で扱い、内部で source type ごとに分岐する案。

採用しない理由:

- source 追加のたびに中心 worker の条件分岐が増える。
- source adapter と worker の責務境界が曖昧になる。
- source ごとの成功 / 失敗ログを扱いにくくなる。
- manager が worker 単位で source を追加 / 削除しにくくなる。

### 採用理由

- source の追加 / 削除を worker 単位で扱いやすい。
- source ごとの成功 / 失敗ログを取りやすい。
- source ごとの timeout や failure reason を分離しやすい。
- `Promise.allSettled` などで並列実行しやすい。
- manager を薄い orchestrator に保ちやすい。
- 将来 source が増えた場合も、既存 worker への影響を抑えやすい。

### 未決事項

- 各 source worker が受け取る input schema。
- 各 source worker が返す `SourceWorkerResult` / `CandidateItem` の具体 schema。
- source adapter と worker の責務境界。
- adapter 単位の success / failure log を shared state にどう残すか。
- 各 worker の timeout 秒数。
- 各 worker の取得件数上限。

### 実装への影響

- manager は source worker の一覧を探索計画として持つ。
- manager は worker の内部実装を知らず、共通の worker result だけを見る。
- source worker はソース種別ごとにファイル / module を分ける。
- worker の出力形式は必ず共通化する。
- source 固有の取得処理は source adapter に閉じ込める。
- source ごとの失敗は worker result に `failureReason` として残す。

## 3. Shared Memory の基本方針

### 今回の論点

shared memory を、本文全文まで持つ共有ストアにするか、manager 判断用の構造化メタデータ中心の共有ストアにするかを決める。

### 決定事項

shared memory は **メタデータ中心** にし、本文全文は直接持たない。

shared memory には、manager が次の action を判断するための構造化メタデータを置く。

本文全文、抽出済み本文、翻訳本文は shared memory に直接載せず、別の参照先に置く前提にする。

shared memory には本文そのものではなく、`contentRef` のような参照情報を持たせる。

manager は shared memory だけを見て、探索継続、停止、翻訳対象確定、部分成功 / 失敗の判断を行う。

translation と output は、必要に応じて `contentRef` から本文を読む。

### 採らなかった選択肢

#### 案 B: shared memory に本文全文も持つ構成

shared memory にメタデータと本文全文の両方を持つ案。

採用しない理由:

- 長文本文が state に入り、shared memory が重くなりやすい。
- manager が不要な本文情報を抱えやすい。
- judge、translation、output の責務と manager 判断用 state が混ざりやすい。
- 10 記事 3 分以内の性能目標に不利になりやすい。

#### 案 C: managerState / contentStore の二層構造を最初から明示する構成

manager 用 state と本文用 store を最初から別コンポーネントとして明示する案。

採用しない理由:

- 設計としてはきれいだが、MVP 初期としては構造を 1 段増やしすぎる。
- 現時点では、まず本文を shared memory に直接持たないという原則だけ決まれば十分である。
- 後から必要になれば、案Aの `contentRef` 前提から自然に二層構造へ拡張できる。

### 採用理由

- manager を薄い orchestrator に保ちやすい。
- shared memory を manager 判断用の軽い state にできる。
- 本文抽出失敗や部分成功を metadata と別に扱いやすい。
- 完全翻訳と性能目標の両立に有利。
- 将来 cache、translation QA、content store 分離へ拡張しやすい。

### 未決事項

- `contentRef` が指す参照先の実体。
- 本文、抽出済み本文、翻訳本文をどの store / layer で持つか。
- shared memory に載せる `shortSummary` を worker が作るか judge が作るか。
- manager が判断に必要とする metadata の最小項目。
- `CandidateItem` と `SourceWorkerResult` の具体 schema。

### 実装への影響

- shared memory は manager 判断用 metadata を中心に設計する。
- worker は本文全文ではなく metadata と `contentRef` を返す形に寄せる。
- translation と output は shared memory の本文フィールドではなく参照先から本文を取得する。
- 後続の schema 議論では、`CandidateItem` に `contentRef` を含める前提で項目を決める。
