# 2026-05-04 MVP-0 実装詳細設計コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` MVP-0 の実装に入る前に、実装時に迷いやすい詳細設計を決める。
- 決定事項を `docs/design/mvp-0-implementation-design.md` に追記して、次回以降も同じ文書へ決定ログを蓄積する。
- 実装開始前に、source adapter、本文保存、出力先、実装技術の方針を固定する。

## 2. 現在地（Current status）

- 完了:
  - リポジトリ全体を確認し、現行 source of truth と archive の位置づけを把握した。
  - `source adapter` と `official_blog_worker` の責務境界を決定した。
  - `contentRef` の意味、本文保存方式、DB を使わない理由を確認した。
  - Markdown research brief と記事本文の出力先・命名規則を決定した。
  - MVP-0 の実装技術として TypeScript + Node.js + LangGraph.js を採用する方針を決定した。
  - `docs/design/mvp-0-implementation-design.md` を作成し、ここまでの決定を記録した。
  - 実装詳細設計の決定ログをコミットした。
- 進行中:
  - 次の論点は「公式ブログ source ごとの取得方法」。

## 3. 重要な決定（Key decisions）

- 結論: `source adapter` は source 固有の取得・抽出・最低限の正規化まで担当する。
  - 理由: OpenAI / Anthropic / LangChain / LangGraph は取得方法や HTML 構造が異なる可能性が高く、差分を adapter に閉じ込めるため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `1. source adapter と official_blog_worker の責務境界`

- 結論: `official_blog_worker` は複数 adapter の実行、`SourceRunResult` への集約、失敗整理だけを担当する。
  - 理由: worker を薄く保ち、後から source を追加するときの変更箇所を adapter 追加と登録に限定するため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `1. source adapter と official_blog_worker の責務境界`

- 結論: `contentRef` は、抽出済み記事本文を保存したローカル Markdown ファイルへの参照パスにする。
  - 理由: shared state に本文全文を載せず、manager 用 metadata と translation / output 用本文を分離するため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `2. contentRef の実体と本文保存方式`

- 結論: MVP-0 では DB 保存をしない。
  - 理由: hosted DB は MVP-0 scope 外であり、schema / migration / 接続 / 永続化エラー処理が検証価値に対して重いため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `2. contentRef の実体と本文保存方式`

- 結論: 記事本文は `output/content/{runId}/{candidateId}.md` に保存する。
  - 理由: translation / output layer が `contentRef` から本文を読め、失敗時にも中身を確認しやすいため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `2. contentRef の実体と本文保存方式`

- 結論: 最終 research brief は `output/briefs/{runId}/ai-research-brief.md` に保存する。
  - 理由: 同じ日に複数回実行しても上書きされず、記事本文と最終 brief を `runId` で対応付けられるため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `3. Markdown research brief の出力先と命名規則`

- 結論: MVP-0 は TypeScript + Node.js + LangGraph.js で実装する。
  - 理由: controlled workflow を `StateGraph` と node / shared state として表現しやすく、保守性の懸念を抑えられるため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `4. MVP-0 の実装技術と初期 scaffold`

- 結論: LangGraph.js は orchestration に限定し、business logic は通常 TypeScript module に分離する。
  - 理由: node が太ることを避け、adapter / translation / output を単体テストしやすくするため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `4. MVP-0 の実装技術と初期 scaffold`

- 結論: MCP server は MVP-0 では導入しない。
  - 理由: MCP は外部 interface であり、MVP-0 の中核である公式ブログ取得、本文抽出、翻訳、Markdown brief 生成の検証には直接効きにくいため。
  - 記録先: `docs/design/mvp-0-implementation-design.md` の `4. MVP-0 の実装技術と初期 scaffold`

## 4. 未決事項・不明点（Open questions / Unknowns）

- 公式ブログ source ごとの取得方法。
  - なぜ重要か: OpenAI / Anthropic / LangChain / LangGraph を RSS、sitemap、一覧 HTML のどれで取得するかにより adapter 実装が変わるため。
  - 何が分かれば決められるか: 各 source の公式ブログ一覧、RSS / feed / sitemap の有無、本文ページ構造。

- 翻訳 API / model の具体選定。
  - なぜ重要か: translation layer の入出力、環境変数、失敗処理、コストに影響するため。
  - 何が分かれば決められるか: MVP-0 で使う provider、model、API key 管理方法、翻訳失敗時の扱い。

- LangGraph.js の state schema 詳細。
  - なぜ重要か: graph node 間の契約になり、manager / worker / dedupe / translation / output の接続点になるため。
  - 何が分かれば決められるか: `CandidateItem`、`SourceRunResult`、`TranslationResult`、run summary の最終項目。

- `candidateId` / `runId` の生成ルール。
  - なぜ重要か: contentRef のファイルパス衝突、再現性、デバッグ性に影響するため。
  - 何が分かれば決められるか: source 名 + index か URL hash を使うか、runId の時刻形式。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- MVP-0 対象 source:
  - OpenAI
  - Anthropic
  - LangChain
  - LangGraph
- MVP-0 対象外:
  - GitHub Releases / changelog
  - 公式ドキュメント更新
  - Hacker News
  - Reddit / X / Zenn / Qiita / dev.to
  - 通知 / 音声 / hosted DB / 定期実行
  - 深い自律探索 / relevance score / importance score
- 実装方針:
  - TypeScript + Node.js + LangGraph.js
  - LangGraph.js は orchestration に限定する。
  - source adapter / storage / dedupe / translation / output は通常 module として分離する。
  - MCP server は将来、graph 実行関数を tool handler から呼ぶ形で追加する。
- 保存方針:
  - 記事本文: `output/content/{runId}/{candidateId}.md`
  - 最終 brief: `output/briefs/{runId}/ai-research-brief.md`
  - `contentRef` は本文ファイルへの参照パス。

## 6. 関連ファイル（Files touched / relevant files）

- `docs/design/mvp-0-implementation-design.md`
  - なぜ重要か: MVP-0 実装詳細設計の決定ログ。
  - 何が変わったか: adapter/worker 境界、contentRef、出力先、LangGraph.js 採用方針を新規作成。
  - 関連コミットID: `98ddc08`

- `docs/design/mvp-requirements.md`
  - なぜ重要か: MVP-0 要件の source of truth。
  - 何が変わったか: 今回は未編集。実装詳細設計の前提として参照した。

- `docs/design/product-vision-and-mvp-direction.md`
  - なぜ重要か: 最終プロダクト像と MVP 絞り込み方針の source of truth。
  - 何が変わったか: 今回は未編集。MVP-0 scope の判断基準として参照した。

- `AGENTS.md`
  - なぜ重要か: この repo での作業ルールと MVP-0 制約。
  - 何が変わったか: 今回は未編集。提案フォーマットと source of truth を確認した。

## 7. 評価文脈（Evaluation context）

- 使った/使う予定のデータセット:
  - N/A。まだ実装前の設計フェーズ。
- 重要指標:
  - 公式ブログ source から候補を取得できること。
  - 本文抽出結果を `contentRef` で参照できること。
  - 成功した source の結果だけで Markdown research brief を生成できること。
  - source 失敗や翻訳失敗の理由が Markdown または summary に残ること。
- 注意点:
  - MVP-0 では時間制限を置かない。
  - ranking / judging は URL 重複除去に留める。
  - DB / cache / hosted service は評価対象外。

## 8. 次回やること（Next steps）

1. 公式ブログ source ごとの取得方法を調査・決定する。
   - Exit criteria: OpenAI / Anthropic / LangChain / LangGraph それぞれの取得方法が決まる。
2. 各 source adapter の fallback 方針を決める。
   - Exit criteria: RSS が無い場合に sitemap / HTML 一覧へ進むかが決まる。
3. `candidateId` と `runId` の生成ルールを決める。
   - Exit criteria: ファイルパス衝突を避ける命名規則が決まる。
4. LangGraph.js の shared state schema を決める。
   - Exit criteria: graph node 間で受け渡す state の型が決まる。
5. 翻訳 API / model / 環境変数の扱いを決める。
   - Exit criteria: translation layer の実装前提が決まる。
6. 決まった内容を `docs/design/mvp-0-implementation-design.md` に追記する。
   - Exit criteria: 次の実装判断が決定ログに残る。
7. 実装 scaffold に入る。
   - Exit criteria: `package.json`、`tsconfig.json`、`src/` 基本構成を作れる状態になる。

## 9. リスク（Risks / gotchas）

- LangGraph.js node が business logic を抱え込みすぎる。
  - 回避策: node は薄い wrapper にし、実処理は通常 module に委譲する。

- 公式ブログの HTML 構造変更で本文抽出が壊れる。
  - 回避策: source 固有処理を adapter に閉じ込め、失敗理由を `SourceRunResult` に残す。

- `contentRef` のファイルパスが不安定になる。
  - 回避策: `runId` と `candidateId` の生成規則を次に決める。

- DB や cache を早く入れて MVP-0 scope が膨らむ。
  - 回避策: MVP-0 ではローカル Markdown 保存に固定する。

- MCP server を先に入れて interface 設計に引っ張られる。
  - 回避策: MVP-0 では graph 実行関数までに留め、MCP は後続で追加する。

- 旧 archive の Phase 1 CLI / HN / 速度目標が復活する。
  - 回避策: 現行 source of truth は `docs/design/product-vision-and-mvp-direction.md` と `docs/design/mvp-requirements.md` を優先する。

## 10. 参考（References, optional）

- LangGraph JavaScript docs
  - https://docs.langchain.com/oss/javascript/langgraph
  - LangGraph.js を orchestration framework として使う判断の参考。
- LangGraph.js `StateGraph` API Reference
  - https://langchain-ai.github.io/langgraphjs/reference/classes/langgraph.StateGraph.html
  - node と shared state の構造を確認するための参考。
- MCP TypeScript SDK
  - https://github.com/modelcontextprotocol/typescript-sdk
  - MCP server を MVP-0 では後回しにする判断の参考。

## 関連コミットID

- `98ddc08` docs: MVP-0実装詳細設計の決定ログを追加
