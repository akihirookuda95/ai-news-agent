# AGENTS.md

## 目的

`ai-news-agent` を、manager 主導の最小マルチエージェントシステムとして扱え。  
このシステムは、英語圏の AI 一次情報を収集し、技術用語を壊さず日本語へ整理し、AI 実務者が重要な変化を短時間で判断しやすくすることを目的とする。

## 現在のフェーズ

このリポジトリは、現在次の段階にある。

- 最小マルチエージェント構成の設計
- その構成に対する技術選定
- 実装コードはまだ source of truth とみなすな

次の文書と Issue を現時点の source of truth として扱え。

- `docs/specs/ai-news-agent-spec.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- GitHub Issue `#11`
- GitHub Issue `#12`

コードや古いメモがこれらと矛盾する場合は、必ず上記の文書と Issue を優先しろ。

## プロダクト制約

- 主用途は読むこととし、音声ファーストにはするな。
- 優先ソースは次に限定しろ。
  - 公式ブログ
  - GitHub Releases / changelog
  - 公式ドキュメント更新
  - Hacker News は補助ソースとして扱え
- Reddit、X、dev.to、Zenn は現時点の最小スコープに含めるな。
- 完全翻訳の対象は次に限定しろ。
  - 本文
  - 見出し
  - 箇条書き
- 次は翻訳するな。
  - 表
  - コードブロック
- 性能目標は次の条件で守れ。
  - 5記事を2分以内で処理しろ
  - 10記事を3分以内で処理しろ
  - 計測範囲はコマンド開始から Markdown 生成完了までとしろ
  - キャッシュなしを前提にしろ
  - 音声なしを前提にしろ

## 設計原則

- アーキテクチャは manager 主導で維持しろ。
- agent 間の受け渡しは自由文ではなく構造化された shared state を優先しろ。
- source adapter、normalization、ranking、translation、output の責務を分離しろ。
- 二次情報より一次情報を優先しろ。
- 高度な自律性を足す前に、最小マルチエージェントのスコープに整合させろ。
- 仕様書や Issue に反映されていない推測ベースの機能を導入するな。

## 作業ルール

- アーキテクチャやスコープを変える前に、関連する docs か Issue を先に更新しろ。
- `docs/specs/ai-news-agent-spec.md`、`docs/design/minimal-multi-agent-design-items.md`、`docs/design/minimal-multi-agent-design-guidelines.md` を現行の設計基準として扱え。
- `.claude/` のような無関係なファイルは、明示的な依頼がない限りコミットするな。
- 現在の最小マルチエージェント方針と矛盾する古い `Phase 1 MVP CLI` 前提を復活させるな。
- 実装時は、責務の明確さ、テストしやすさ、性能制約を優先しろ。
- 設計フェーズでは、`docs/design/minimal-multi-agent-design-guidelines.md` を常に参照しながら議論しろ。
- このプロジェクトを通して学んだことが発生したら、`docs/dev-notes/` 配下に学びメモの Markdown を追加しろ。

## GitLab運用ルール

- 日常の開発運用は GitLab を主系として扱え。
- ユーザーが `#<number>` を示した場合、文脈上不自然でない限り GitLab の Issue または Merge Request 番号として扱え。
- `#<number>` が Issue か Merge Request かを文脈で判定できない場合のみ、短く確認しろ。
- GitLab 上の Issue / Merge Request の参照や操作には `glab` を使え。
- GitHub 上の historical な Issue を参照する場合は、`GitHub Issue #11` のように明示されたときだけ扱え。

## 実装の方向性

近い将来に必要となる構成要素を次とみなせ。

- `manager agent`
- `source worker agents`
- `judge / dedupe agent`
- `translation agent`
- `markdown output layer`

大きな実装に入る前に、次の設計論点を詰めろ。

- manager の責務
- source worker の境界
- shared memory の schema
- normalization / content extraction の責務境界
- 停止条件 / 成功条件
- orchestration flow
- error handling
- parallelism strategy
