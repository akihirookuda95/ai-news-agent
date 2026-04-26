# 2026-04-26 ai-news-agent 最小マルチエージェント設計再開コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` の開発を約 1 か月ぶりに再開し、設計議論の進め方を整理する。
- GitHub 移行後の issue / remote / docs 状態を整える。
- 最小マルチエージェント構成について、まず `manager` と `source worker` の責務を確定する。

## 2. 現在地（Current status）

- GitHub の open issue 9 件をすべて close 済み。
- `origin` は `git@github.com:akihirookuda95/ai-news-agent.git` に更新済み。
- `AGENTS.md` から GitLab 運用ルールを削除済み。
- 設計再開用の docs を追加済み。
- `manager` は薄い orchestrator とする方針で合意済み。
- `source worker` はソース種別ごとに分ける案Aで合意済み。
- 次の議論予定は `Shared Memory の最小 schema`。

## 3. 重要な決定（Key decisions）

- 結論: `manager` は薄い orchestrator とする。
  - 理由: LangGraph の supervisor pattern と整合し、責務分離、並列化、将来拡張がしやすい。
  - 記録先: `docs/design/minimal-multi-agent-decisions.md` の `1. Manager の責務`

- 結論: `manager` は fetch、本文抽出、normalization、dedupe、ranking score 算出、翻訳、Markdown 書き出しを持たない。
  - 理由: manager が太ると worker / judge / translation / output の境界が崩れるため。
  - 記録先: `docs/design/minimal-multi-agent-decisions.md` の `1. Manager の責務`

- 結論: `source worker` はソース種別ごとに分ける。
  - 理由: 成功 / 失敗ログを取りやすく、将来 source を追加 / 削除しやすく、並列化しやすいため。
  - 記録先: `docs/design/minimal-multi-agent-decisions.md` の `2. Source Worker の最小構成`

- 結論: MVP の worker は `official_blog_worker`、`github_release_worker`、`docs_update_worker`、`hacker_news_worker` とする。
  - 理由: MVP の対象 source と一致し、source ごとの責務境界が明確なため。
  - 記録先: `docs/design/minimal-multi-agent-decisions.md` の `2. Source Worker の最小構成`

- 結論: `official_blog_worker` は複数 source adapter を内部に持ち、MVP では child worker 化しない。
  - 理由: 初期実装の複雑化を避けつつ、将来の child worker 昇格余地を残すため。
  - 記録先: `docs/design/minimal-multi-agent-decisions.md` の `official_blog_worker の扱い`

## 4. 未決事項・不明点（Open questions / Unknowns）

- `Shared Memory` の最小 schema。
  - なぜ重要か: manager が shared state だけを見て次の action を決められる必要があるため。
  - 何が分かれば決められるか: `CandidateItem`、`SourceWorkerResult`、`RankedItem` の必須項目。

- source adapter と source worker の責務境界。
  - なぜ重要か: 取得、本文抽出、正規化の置き場所が実装構造に直結するため。
  - 何が分かれば決められるか: adapter が raw fetch までか、metadata extraction まで持つか。

- manager の停止条件 / 成功条件。
  - なぜ重要か: 追加探索の暴走や低品質な記事数合わせを避けるため。
  - 何が分かれば決められるか: 必要件数、一次情報比率、追加探索回数、部分成功条件。

- worker / adapter 単位の timeout と failure log の持ち方。
  - なぜ重要か: 部分成功と性能目標を両立するため。
  - 何が分かれば決められるか: source ごとの取得時間、失敗分類、shared state schema。

- 技術選定。
  - なぜ重要か: LangGraph.js / 素の TypeScript / MCP first / CLI first の判断に関わるため。
  - 何が分かれば決められるか: 責務境界、state schema、標準フロー。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- manager 主導の最小マルチエージェント構成を採用する。
- manager は計画、委譲、進行管理、停止判定、翻訳対象確定、最終状態確定に集中する。
- source worker は source 種別ごとに分ける。
- worker の出力形式は共通化する必要がある。
- Hacker News は補助ソースであり、一次情報の代替ではない。
- `official_blog_worker` は複数 adapter を内部に持てる。
- MVP の主軸は読む用途、Markdown 出力、完全翻訳。
- Reddit、X、dev.to、Zenn は MVP 対象外。
- 性能目標は 5 記事 2 分以内、10 記事 3 分以内。
- 測定範囲はコマンド開始から Markdown 生成完了まで、キャッシュなし、音声なし。

## 6. 関連ファイル（Files touched / relevant files）

- `AGENTS.md`
  - なぜ重要か: GitHub 移行に合わせ、GitLab 運用ルールを削除した。
  - 関連コミットID: `d5efbc1`

- `docs/design/current-discussion-points.md`
  - なぜ重要か: 今後議論する設計論点の一覧。
  - 何が変わったか: 開発再開時の論点を整理。
  - 関連コミットID: `6b43538`

- `docs/development-flow.md`
  - なぜ重要か: 設計議論から実装、性能検証、Codex CLI / MCP 接続までの流れ。
  - 何が変わったか: 開発全体の進め方を追加。
  - 関連コミットID: `ee2204f`

- `docs/design/discussion-rules.md`
  - なぜ重要か: 議論フォーマットと docs 反映ルール。
  - 何が変わったか: 1 論点ずつ議論し、決定を記録する運用を定義。
  - 関連コミットID: `c0de7fa`

- `docs/design/minimal-multi-agent-decisions.md`
  - なぜ重要か: 実際に決まった設計判断のログ。
  - 何が変わったか: manager と source worker の決定事項を追加。
  - 関連コミットID: 未コミット（このセッション末にコミット予定）

## 7. 評価文脈（Evaluation context）

- まだ実装や評価データセットはない。
- MVP の重要指標:
  - 5 記事を 2 分以内で処理。
  - 10 記事を 3 分以内で処理。
  - コマンド開始から Markdown 生成完了までを測定。
  - キャッシュなし、音声なし。
- 注意点:
  - 完全翻訳と 10 記事 3 分以内は衝突しやすい。
  - 翻訳並列数、本文長、timeout は今後設計が必要。

## 8. 次回やること（Next steps）

1. `Shared Memory の最小 schema` を議論する。
   - Exit criteria: `CandidateItem`、`SourceWorkerResult`、`status`、`failureReason` の必須項目が決まる。
2. 本文全文を shared memory に持つか、本文参照だけにするかを決める。
   - Exit criteria: manager が読む state と translation が読む本文の分離方針が決まる。
3. source adapter と worker の責務境界を決める。
   - Exit criteria: adapter / worker / normalization の責務が説明できる。
4. manager の停止条件 / 成功条件を決める。
   - Exit criteria: 追加探索、部分成功、失敗の条件が決まる。
5. worker / adapter 単位の failure log の形式を決める。
   - Exit criteria: 部分失敗を Markdown や manager 判断に反映できる。
6. 決定した内容を `minimal-multi-agent-decisions.md` に追記する。
7. 必要に応じて `minimal-multi-agent-design-items.md` を「決定済み」状態に更新する。

## 9. リスク（Risks / gotchas）

- manager が太るリスク。
  - 回避策: manager は orchestration と判断に限定し、実処理を持たせない。

- worker を細かくしすぎて初期実装が重くなるリスク。
  - 回避策: source 種別で分けるが、official blog の source ごとは adapter に留める。

- shared memory が自由文ログや本文置き場になるリスク。
  - 回避策: 次回 schema 議論で manager 用 metadata と本文参照を分ける。

- 完全翻訳と性能目標が衝突するリスク。
  - 回避策: 翻訳単位、本文長、並列数、timeout を後続論点で決める。

- GitHub issue をすべて close したため、旧 Issue #11 / #12 前提が docs に残るリスク。
  - 回避策: source of truth を docs と新しい決定ログへ移す。

## 10. 参考（References, optional）

- LangGraph Agent Supervisor tutorial
  - supervisor は specialized agents に委譲し、実作業をしない薄い orchestrator として扱う例。
- LangGraph.js Multi-agent Systems concepts
  - supervisor node は次に呼ぶ agent を決める routing node として説明される。
- LangChain blog: LangGraph Multi-Agent Workflows
  - multi-agent では責務と tool を agent ごとに分ける利点が説明されている。

## 関連コミットID

- `d5efbc1` AGENTS.md から GitLab 運用ルールを削除
- `6b43538` docs: 開発再開時の議論論点を整理
- `ee2204f` docs: 開発全体の進め方を整理
- `c0de7fa` docs: 設計議論の進め方を定義

