# 2026-04-04 設計開始前整理コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` の最小マルチエージェント構成について、設計フェーズを迷わず再開できる状態にする。
- リポジトリを旧実装の残骸から切り離し、仕様・設計中心の構成に揃える。
- 設計議論の基準文書と参照順を固定する。

## 2. 現在地（Current status）

- 完了:
  - 仕様書を `docs/specs/ai-news-agent-spec.md` に移動した。
  - `docs/schedule.md` と `docs/spec-review-topics.md` を削除した。
  - `README.md` に、このリポジトリの目的と現在のフェーズを記載した。
  - `AGENTS.md` を追加し、その後日本語化した。
  - `docs/design/minimal-multi-agent-design-items.md` に最小マルチエージェント構成の設計項目を整理した。
  - `docs/design/minimal-multi-agent-design-guidelines.md` に設計ガイドラインを追加した。
  - `CLAUDE.md` を削除した。
  - 旧 `src/`、`package.json`、`package-lock.json`、`tsconfig.json` を削除した。
  - Issue `#11` と `#12` の参照先を現行パスに更新した。
- 進行中:
  - 最小マルチエージェント構成そのものの詳細設計は未着手。
  - 技術選定 Issue `#12` は未着手。

## 3. 重要な決定（Key decisions）

- 結論: 現在の source of truth は `docs/specs/ai-news-agent-spec.md`、`docs/design/minimal-multi-agent-design-items.md`、`docs/design/minimal-multi-agent-design-guidelines.md`、Issue `#11`、Issue `#12` とする。
  - 理由: 旧実装ファイルや古いメモではなく、現行の設計判断に基づいて進めるため。
  - 記録先: `AGENTS.md`

- 結論: 設計フェーズでは、`docs/design/minimal-multi-agent-design-guidelines.md` を常に参照しながら議論する。
  - 理由: 論点の切り方、責務境界、停止条件、失敗時設計の視点を固定するため。
  - 記録先: `AGENTS.md`、`docs/design/minimal-multi-agent-design-guidelines.md`

- 結論: 仕様書は `docs/specs/` 配下に配置し、プロジェクト全体仕様書として扱う。
  - 理由: 設計資料と仕様書の役割を分け、ファイル構成を明確にするため。
  - 記録先: `docs/specs/ai-news-agent-spec.md`、`README.md`

- 結論: 旧 Node/TypeScript 実装スキャフォールドは削除し、技術選定後に必要な構成で作り直す。
  - 理由: 現在の package 群と `src/` は旧前提に基づいており、技術選定を歪めるため。
  - 記録先: git history、Issue `#12`

- 結論: `CLAUDE.md` は削除し、agent 向けルールは `AGENTS.md` に一本化する。
  - 理由: 今後 Claude Code は使わず、古い前提も残したくないため。
  - 記録先: `AGENTS.md`

## 4. 未決事項・不明点（Open questions / Unknowns）

- manager の責務をどこまで持たせるか。
  - なぜ重要か: manager が太りすぎると設計が崩れ、細すぎると統制が効かなくなるため。
  - 何が分かれば決められるか: 停止条件、再探索条件、最終確定の責務をどこに置くか。

- source worker を何本にするか。
  - なぜ重要か: 並列化戦略、shared memory 設計、性能に直結するため。
  - 何が分かれば決められるか: `official_blog`、`github_release`、`docs_update`、`hacker_news` をどう束ねるか。

- shared memory の最小 schema をどうするか。
  - なぜ重要か: manager / worker / judge の契約そのものになるため。
  - 何が分かれば決められるか: `CandidateItem` に必須な項目と失敗時の表現方法。

- manager の停止条件 / 成功条件をどこまで厳密にするか。
  - なぜ重要か: 部分成功を返せるかどうかがここで決まるため。
  - 何が分かれば決められるか: 最低件数、一次情報比率、再探索回数上限の扱い。

- 技術選定で Node/TypeScript を採るかどうか。
  - なぜ重要か: package や scaffold を再作成するタイミングに影響するため。
  - 何が分かれば決められるか: Issue `#12` での実装言語・ランタイム・orchestration 手段の判断。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- 現在の前提構成:
  - `manager agent`
  - `source worker agents`
  - `judge / dedupe agent`
  - `translation agent`
  - `markdown output layer`

- 設計順序:
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
  - 設計中は framework 前提で責務を決めない
  - 技術選定後に package と tsconfig を再作成する可能性がある

## 6. 関連ファイル（Files touched / relevant files）

- `AGENTS.md`
  - なぜ重要か: 現在の source of truth、作業ルール、設計フェーズの参照先を定義するため。
  - 何が変わったか: 日本語化し、設計ガイドライン参照を明記した。
  - 関連コミットID:
    - `94b7c82` AGENTS.md を追加し設計メモ名を整理
    - `5555c1b` 最小マルチエージェント設計ガイドラインを追加
    - `c6c6c53` AGENTS.md を日本語化

- `docs/specs/ai-news-agent-spec.md`
  - なぜ重要か: プロジェクト全体の仕様書本体であるため。
  - 何が変わったか: `docs/` 直下から `docs/specs/` 配下へ移動した。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

- `docs/design/minimal-multi-agent-design-items.md`
  - なぜ重要か: 設計フェーズで決めるべき項目の一覧であるため。
  - 何が変わったか: `phase1` 名をやめ、最小マルチエージェント前提に統一した。
  - 関連コミットID:
    - `94b7c82` AGENTS.md を追加し設計メモ名を整理

- `docs/design/minimal-multi-agent-design-guidelines.md`
  - なぜ重要か: 設計議論の視点固定に使う基準文書であるため。
  - 何が変わったか: 新規追加した。
  - 関連コミットID:
    - `5555c1b` 最小マルチエージェント設計ガイドラインを追加

- `README.md`
  - なぜ重要か: このリポジトリが何をする場所かを最短で理解する入口になるため。
  - 何が変わったか: リポジトリの目的と現在フェーズを記載した。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

- `contexts/20260403_design-phase-shift.md`
  - なぜ重要か: 直前セッションの設計移行判断を保持しているため。
  - 何が変わったか: 仕様書パス変更に合わせて参照を更新した。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

- `daily-log/2026-04-03.md`
  - なぜ重要か: 直前セッションの作業記録であり、設計フェーズへの移行経緯を確認できるため。
  - 何が変わったか: 仕様書パス変更に合わせて参照を更新した。
  - 関連コミットID:
    - `7ea399d` 仕様書配置と関連ドキュメントを整理

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
  - Hacker News は補助ソースなので、件数だけ満たしても成功とはみなさない
  - まだ実装前なので、現時点の指標は仕様上の目標であり実測値ではない

## 8. 次回やること（Next steps）

- 1. Issue `#11` で manager の責務を決める
  - exit criteria: manager が持つ判断と持たない責務を説明できる
- 2. source worker の種類と担当範囲を決める
  - exit criteria: 各 worker の入力・出力・担当ソースを定義できる
- 3. shared memory の最小 schema を決める
  - exit criteria: `CandidateItem` 相当の項目一覧を固定できる
- 4. normalization / content extraction の責務境界を決める
  - exit criteria: source adapter と worker の境界を説明できる
- 5. manager の停止条件 / 成功条件を決める
  - exit criteria: 全体成功 / 部分成功 / 失敗の条件を文章化できる
- 6. judge / dedupe の選別ルールを決める
  - exit criteria: 一次情報優先と重複除去のルールを説明できる
- 7. translation の責務と chunking 方針を決める
  - exit criteria: 完全翻訳の実装条件を説明できる
- 8. その後に Issue `#12` で技術選定に入る
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

- 一次情報優先の原則が、後で ranking の好みに落ちる。
  - 回避策: judge と停止条件に一次情報優先ルールを埋め込む。

- `.claude/`、`docs/ai-news-agent_differentiation_strategy.md`、`docs/design/issue-28-design-guidelines.md` を誤ってコミットする。
  - 回避策: 明示依頼があるまで除外し続ける。

## 10. 参考（References, optional）

- `https://github.com/akihirookuda95/ai-news-agent/issues/11`
  - 最小マルチエージェント構成の設計 Issue。

- `https://github.com/akihirookuda95/ai-news-agent/issues/12`
  - 技術選定 Issue。

- `docs/design/minimal-multi-agent-design-guidelines.md`
  - 設計議論の視点固定に使う基準文書。

- `docs/design/minimal-multi-agent-design-items.md`
  - 具体的に何を設計するかを並べた項目一覧。

関連コミットID（短縮SHA + 1行要約）

- `5555c1b` 最小マルチエージェント設計ガイドラインを追加
- `7ea399d` 仕様書配置と関連ドキュメントを整理
- `58b53ef` 旧Node/TypeScriptスキャフォールドを削除
- `c6c6c53` AGENTS.md を日本語化
