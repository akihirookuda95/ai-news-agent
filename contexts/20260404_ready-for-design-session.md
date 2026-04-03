# 2026-04-04 設計開始直前コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` の最小マルチエージェント構成の設計議論を次セッションですぐ始める。
- 設計開始前に行ったリポジトリ整理、運用ルール整理、保存先整理の結果を引き継ぐ。
- 次セッションで Issue `#11` の設計論点に直接入れる状態にする。

## 2. 現在地（Current status）

- 完了:
  - PR `#13` が `main` にマージ済み。
  - `main` を最新化し、現在の作業ブランチは `design/11`。
  - 仕様書は `docs/specs/ai-news-agent-spec.md` に移動済み。
  - 設計項目メモは `docs/design/minimal-multi-agent-design-items.md`。
  - 設計ガイドラインは `docs/design/minimal-multi-agent-design-guidelines.md`。
  - `AGENTS.md` を追加し、日本語化し、設計時の参照ルールを反映済み。
  - `Contexts` は `contexts` に rename 済み。
  - `docs/daily` は `daily-log` に移動済み。
  - 旧 `src/`、`package.json`、`package-lock.json`、`tsconfig.json` は削除済み。
  - `.github` の Claude 用 workflow は削除済み。
  - `.claude` は削除済み。
- 進行中:
  - 最小マルチエージェント構成の詳細設計はこれから。
  - 技術選定 Issue `#12` は未着手。

## 3. 重要な決定（Key decisions）

- 結論: 現在の設計基準は `docs/specs/ai-news-agent-spec.md`、`docs/design/minimal-multi-agent-design-items.md`、`docs/design/minimal-multi-agent-design-guidelines.md`、Issue `#11`、Issue `#12` とする。
  - 理由: 旧実装や古いメモではなく、現在の最小マルチエージェント前提に統一するため。
  - 記録先: `AGENTS.md`

- 結論: 設計フェーズでは `docs/design/minimal-multi-agent-design-guidelines.md` を常に参照する。
  - 理由: 責務、契約、停止条件、失敗時、性能の視点を固定するため。
  - 記録先: `AGENTS.md`

- 結論: コンテキスト保存先は `contexts/`、日報保存先は `daily-log/` とする。
  - 理由: 用途別に保存先を明確にし、今後の運用を統一するため。
  - 記録先: `/Users/akihirookuda/.codex/skills/context/SKILL.md`、`/Users/akihirookuda/.codex/skills/daily-log/SKILL.md`

- 結論: 学びが発生したら `docs/dev-notes/` 配下に学びメモを追加する。
  - 理由: 開発を通して得た知見を後から再利用できるようにするため。
  - 記録先: `AGENTS.md`

- 結論: 旧 Node/TypeScript スキャフォールドは削除し、技術選定後に必要な構成で作り直す。
  - 理由: 現行の package 群は旧前提に基づいており、技術選定を歪めるため。
  - 記録先: git history、Issue `#12`

## 4. 未決事項・不明点（Open questions / Unknowns）

- manager の責務をどこまで持たせるか。
  - なぜ重要か: 設計全体の責務分割と停止判定に直結するため。
  - 何が分かれば決められるか: manager が持つ判断と持たない処理を分離できれば決まる。

- source worker を何本に分けるか。
  - なぜ重要か: 並列化、shared memory、性能に影響するため。
  - 何が分かれば決められるか: 公式ブログ、GitHub Releases、docs、HN をどう束ねるか。

- shared memory の最小 schema を何にするか。
  - なぜ重要か: manager / worker / judge の契約になるため。
  - 何が分かれば決められるか: `CandidateItem` に最低限必要な項目が定義できればよい。

- manager の停止条件 / 成功条件をどう定義するか。
  - なぜ重要か: 部分成功を返せるか、再探索をどこで止めるかが決まるため。
  - 何が分かれば決められるか: 最低件数、一次情報の有無、追加探索上限をどう扱うか。

- 実装言語と orchestration 手段を何にするか。
  - なぜ重要か: その後の package 再作成や scaffold に影響するため。
  - 何が分かれば決められるか: Issue `#12` で候補比較できればよい。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- 現在の最小構成前提:
  - `manager agent`
  - `source worker agents`
  - `judge / dedupe agent`
  - `translation agent`
  - `markdown output layer`

- 設計時に優先する順番:
  - manager の責務
  - source worker の責務
  - shared memory
  - normalization / content extraction
  - 停止条件 / 成功条件
  - judge / dedupe
  - translation
  - 標準フロー
  - エラー時
  - 性能 / 追加探索

- 制約:
  - 一次情報優先
  - Hacker News は補助ソース
  - Reddit / X / dev.to / Zenn は現スコープ外
  - 5記事2分 / 10記事3分
  - 完全翻訳対象は本文 / 見出し / 箇条書き

- 仮定:
  - 追加探索は最大 1 ラウンド程度
  - 設計段階では framework 前提で責務を決めない
  - 技術選定後に package と tsconfig を新規作成する可能性が高い

## 6. 関連ファイル（Files touched / relevant files）

- `AGENTS.md`
  - なぜ重要か: 現在の source of truth、作業ルール、設計時参照ルールをまとめているため。
  - 何が変わったか: 日本語化、設計ガイドライン参照、`docs/dev-notes/` 運用を追記済み。
  - 関連コミットID:
    - `94b7c82` AGENTS.md を追加し設計メモ名を整理
    - `5555c1b` 最小マルチエージェント設計ガイドラインを追加
    - `c6c6c53` AGENTS.md を日本語化
    - `55efc73` AGENTS.mdにdev-notes運用を追記

- `docs/specs/ai-news-agent-spec.md`
  - なぜ重要か: プロジェクト全体の仕様書本体であるため。
  - 何が変わったか: `docs/specs/` 配下へ移動済み。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

- `docs/design/minimal-multi-agent-design-items.md`
  - なぜ重要か: 設計フェーズで決める項目を一覧化しているため。
  - 何が変わったか: `phase1` 名をやめ、最小マルチエージェント前提に統一済み。
  - 関連コミットID:
    - `94b7c82` AGENTS.md を追加し設計メモ名を整理

- `docs/design/minimal-multi-agent-design-guidelines.md`
  - なぜ重要か: 設計議論の判断軸を固定するため。
  - 何が変わったか: 新規追加済み。
  - 関連コミットID:
    - `5555c1b` 最小マルチエージェント設計ガイドラインを追加

- `README.md`
  - なぜ重要か: このリポジトリの役割と現在フェーズの入口になるため。
  - 何が変わったか: プロジェクト目的と参照先を記載済み。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

- `contexts/20260403_design-phase-shift.md`
  - なぜ重要か: 設計移行判断の元文脈を保持しているため。
  - 何が変わったか: 現行パス前提へ更新済み。
  - 関連コミットID:
    - `5312502` contextとdaily-logの保存先を整理
    - `7b5b8f6` Contextsディレクトリをcontextsへ改名

- `daily-log/2026-04-03.md`
  - なぜ重要か: 直前セッションの議論と決定事項を確認できるため。
  - 何が変わったか: `daily-log/` 配下へ移動済み。
  - 関連コミットID:
    - `5312502` contextとdaily-logの保存先を整理

## 7. 評価文脈（Evaluation context）

- 使った/使う予定のデータセット:
  - N/A

- 重要指標:
  - 5記事を2分以内
  - 10記事を3分以内
  - 一次情報を含むこと
  - 要約化せず翻訳できること

- 注意点:
  - 音声は性能指標に含めない
  - Hacker News は補助ソースであり、主ソースの代替ではない
  - まだ実装前なので、現時点の指標は仕様上の目標であり実測ではない

## 8. 次回やること（Next steps）

- 1. Issue `#11` の最初の論点として manager の責務を決める
  - exit criteria: manager が持つ判断と持たない責務を文章で説明できる
- 2. source worker の種類と担当範囲を決める
  - exit criteria: 各 worker の担当ソースと返却内容を定義できる
- 3. shared memory の最小 schema を決める
  - exit criteria: `CandidateItem` の必須項目を固定できる
- 4. normalization / content extraction の責務境界を決める
  - exit criteria: source adapter と worker の境界を説明できる
- 5. manager の停止条件 / 成功条件を決める
  - exit criteria: 全体成功 / 部分成功 / 失敗の条件を文章化できる
- 6. judge / dedupe の選別ルールを決める
  - exit criteria: 一次情報優先と重複除去のルールを説明できる
- 7. translation の責務と chunking 方針を決める
  - exit criteria: 完全翻訳の実装条件を説明できる
- 8. その後に Issue `#12` の技術選定へ進む
  - exit criteria: 実装言語、orchestration、取得手段、shared memory 実装方針の候補比較を始められる

## 9. リスク（Risks / gotchas）

- manager に責務を寄せすぎる。
  - 回避策: 設計ガイドラインの `manager を太らせすぎていないか` を毎回確認する。

- worker と source adapter の責務が混ざる。
  - 回避策: normalization / content extraction の責務境界を先に決める。

- shared memory に本文を載せすぎる。
  - 回避策: 構造化メタデータ中心にし、本文は必要時のみ後段で参照する。

- 設計前に framework 前提へ寄りすぎる。
  - 回避策: 技術選定は Issue `#12` に分離し、Issue `#11` では責務と契約だけを先に決める。

- 一次情報優先の原則が ranking の後工程へ後退する。
  - 回避策: judge と停止条件に一次情報優先ルールを埋め込む。

- 過去の `Phase 1` という表現に引きずられる。
  - 回避策: 現在は最小マルチエージェント構成の設計と技術選定を主語にして考える。

## 10. 参考（References, optional）

- `https://github.com/akihirookuda95/ai-news-agent/issues/11`
  - 最小マルチエージェント構成の設計 Issue。

- `https://github.com/akihirookuda95/ai-news-agent/issues/12`
  - 技術選定 Issue。

- `docs/design/minimal-multi-agent-design-guidelines.md`
  - 設計議論の視点固定に使う基準文書。

- `docs/design/minimal-multi-agent-design-items.md`
  - 具体的に何を設計するかを並べた項目一覧。

- `AGENTS.md`
  - 現在の source of truth と運用ルールをまとめたファイル。

関連コミットID（短縮SHA + 1行要約）

- `f5cfeba` PR #13 を main にマージ
- `eafe3d3` Claude向けGitHub workflowを削除
- `7b5b8f6` Contextsディレクトリをcontextsへ改名
- `55efc73` AGENTS.mdにdev-notes運用を追記
- `5312502` contextとdaily-logの保存先を整理
