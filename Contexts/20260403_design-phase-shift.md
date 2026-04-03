# 2026-04-03 設計フェーズ移行コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` の仕様書レビューを Phase 1 実装直前の粒度まで進める。
- `固定パイプラインMVP` ではなく、`最小マルチエージェントMVP` に方針転換する。
- 次セッションで設計フェーズを最短で再開できる状態にする。

## 2. 現在地（Current status）

- 完了:
  - `docs/specs/ai-news-agent-spec.md` に一次ターゲットユーザー、日次行動、主要課題、価値提案を反映。
  - MVP の情報源を `公式ブログ / GitHub Releases / 公式ドキュメント / Hacker News` に統一。
  - Reddit は MVP から外し、将来フェーズで限定導入する方針に確定。
  - 完全翻訳の対象範囲を `本文 / 見出し / 箇条書き`、対象外を `表 / コードブロック` に確定。
  - 性能目標を `5記事で2分以内 / 10記事で3分以内`、測定条件を `キャッシュなし / 音声なし / コマンド開始から md 完了` に確定。
  - MVP の TUI 対話を `自由入力 + 件数 + 音声有無` に最小化。
  - アーキテクチャ概要に `manager 主導の階層型マルチエージェント` を反映。
  - 設計フェーズ用 Issue `#11` と技術選定用 Issue `#12` を作成。
  - `main` を最新化し、`todo/11` ブランチを作成。
- 進行中:
  - Issue `#11` の前提を `最小マルチエージェント構成` に切り替え、設計項目メモを更新済み。
  - まだ設計の中身そのものは未着手。

## 3. 重要な決定（Key decisions）

- 結論: 一次ターゲットは `英語圏のAI一次情報を追いたい日本語圏のAIエンジニア / ソフトウェアエンジニア / 個人開発者`。
  - 理由: ユーザー本人の課題ともっとも一致し、差別化の軸が明確になるため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `ターゲットユーザー`

- 結論: 価値提案は `英語圏のAI一次情報を、技術語を壊さず日本語で整理し、AI実務者が重要な変化を短時間で判断しやすくする`。
  - 理由: `読むべき/試すべき` の断定を避けつつ、価値を具体化できるため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `ターゲットユーザー`

- 結論: MVP の情報源は `公式ブログ / GitHub Releases / 公式ドキュメント / Hacker News`。
  - 理由: 一次情報中心で品質を保ちつつ、Hacker News を補助ソースとして話題検知に使えるため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `MVP で優先する情報源`

- 結論: Reddit は MVP に入れない。
  - 理由: 議論価値は高いがノイズが多く、対象技術に絞らないと軸がぶれるため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `MVP では主導線にしない情報源`

- 結論: 完全翻訳の対象範囲は `本文 / 見出し / 箇条書き`。`表 / コードブロック` は対象外。
  - 理由: 完全翻訳の実装範囲を明確にし、要約混入を防ぎつつ表崩れを避けるため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `6. 翻訳仕様`

- 結論: 性能目標は `5記事で2分以内 / 10記事で3分以内`、測定条件は `キャッシュなし / 音声なし / コマンド開始から md 完了`。
  - 理由: Phase 1 の完了判定を実装可能な形にするため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `8. パフォーマンス目標`

- 結論: MVP の TUI 対話は `自由入力 + 件数 + 音声有無` に最小化。
  - 理由: 日常利用しやすく、せっかちな利用者でも使いやすくするため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `5. TUI 対話フェーズ設計`

- 結論: Phase 1 でも `manager 主導の最小マルチエージェント構成` で実装する。
  - 理由: 作りたい本体がそこにあり、アーキテクチャを最終形に寄せたままスコープだけを狭めるほうがよいため。
  - 記録先: `docs/specs/ai-news-agent-spec.md` の `9. アーキテクチャ概要`、`docs/design/minimal-multi-agent-design-items.md`

## 4. 未決事項・不明点（Open questions / Unknowns）

- manager agent の責務をどこまで持たせるか。
  - なぜ重要か: manager の責務が広すぎると複雑化し、狭すぎるとマルチエージェントの意味が薄れるため。
  - 何が分かれば決められるか: Phase 1 で manager が判断すべき内容と、worker に委譲する内容の境界。

- source worker を何本にするか。
  - なぜ重要か: worker 数は性能と実装コストに直結するため。
  - 何が分かれば決められるか: 公式ブログ、GitHub Releases、docs、HN をどう束ねるか。

- 共有メモリのデータ構造をどうするか。
  - なぜ重要か: manager / worker / judge の連携コストとコンテキスト量に直結するため。
  - 何が分かれば決められるか: 各 agent 間で最低限必要な項目一覧。

- Phase 1 で translation QA agent を入れるか。
  - なぜ重要か: 品質向上には効くが性能目標を壊す可能性があるため。
  - 何が分かれば決められるか: 翻訳失敗リスクと、再翻訳の必要頻度。

- 追加探索を Phase 1 でどこまで許すか。
  - なぜ重要か: manager 主導の意味と性能目標のバランスを取る必要があるため。
  - 何が分かれば決められるか: 記事数不足や偏りの判定方法。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- Phase 1 は `固定パイプライン` ではなく `最小マルチエージェント`。
- 最小構成候補:
  - `manager agent`
  - `official_blog_worker`
  - `github_release_worker`
  - `docs_update_worker`
  - `hacker_news_worker`
  - `judge / dedupe agent`
  - `translation agent`
- 共有は記事全文ではなく、まず `構造化メモリ` を基本にする。
- 制約:
  - Phase 1 の情報源は一次情報中心 + Hacker News 補助
  - 性能目標は `5記事2分 / 10記事3分`
  - 音声は補助機能
  - MCP 化は後続フェーズ
- 仮定:
  - source workers は並列実行
  - 追加探索は Phase 1 では最大 1 ラウンド程度に制限する想定

## 6. 関連ファイル（Files touched / relevant files）

- `docs/specs/ai-news-agent-spec.md`
  - なぜ重要か: 仕様本体。Phase 1 条件と最小マルチエージェント前提が反映されているため。
  - 何が変わったか: ターゲットユーザー、MVP 情報源、翻訳範囲、性能条件、TUI 最小対話、アーキテクチャを具体化。
  - 関連コミットID:
    - `b2b4841`

- `docs/design/minimal-multi-agent-design-items.md`
  - なぜ重要か: 次セッションの設計フェーズの起点になるため。
  - 何が変わったか: 固定パイプライン前提を捨て、最小マルチエージェント設計項目に全面更新。
  - 関連コミットID:
    - 今回コミット予定

- `docs/spec-review-topics.md` は削除済み
  - なぜ重要か: 仕様レビューの残論点一覧として引き続き参照するため。
  - 何が変わったか: 前セッションで追加済み。今回は未変更。
  - 関連コミットID:
    - `ecc7221`

- `Contexts/20260403_design-phase-shift.md`
  - なぜ重要か: 次セッションで設計フェーズに最短復帰するため。
  - 何が変わったか: 今日の決定事項、未決事項、次回ToDoを保存。
  - 関連コミットID:
    - 今回コミット予定

## 7. 評価文脈（Evaluation context）

- 使った/使う予定のデータセット: N/A
- 重要指標:
  - 速度: `5記事2分 / 10記事3分`
  - 翻訳品質: 要約化していないか、技術用語が壊れていないか
  - 情報源品質: 一次情報中心になっているか
- 注意点:
  - 音声は性能指標に含めない
  - Hacker News は補助ソースであり、一次情報の代替ではない
  - Reddit は評価対象外（Phase 1 未導入）

## 8. 次回やること（Next steps）

- 1. manager agent の責務を定義する
  - exit criteria: manager が判断する内容の一覧が固まる
- 2. source worker の種類と担当範囲を決める
  - exit criteria: worker ごとの責務と入出力が決まる
- 3. 共有メモリのデータ構造を定義する
  - exit criteria: `CandidateItem` 相当の型案が決まる
- 4. Phase 1 の標準処理フローを確定する
  - exit criteria: 処理順序と追加探索の有無が固定される
- 5. judge / dedupe の判定ルールを決める
  - exit criteria: 一次情報優先と重複除去のルールが文章化される
- 6. translation agent の chunking と翻訳単位を決める
  - exit criteria: 実装可能な翻訳フローが定義される
- 7. Markdown の最小出力仕様を確定する
  - exit criteria: 出力テンプレートが実装可能な粒度で固まる
- 8. その後に Issue `#12` の技術選定へ進む

## 9. リスク（Risks / gotchas）

- マルチエージェントを早く入れすぎて複雑化する。
  - 回避策: Phase 1 は `最小構成` に限定し、agent 数を増やしすぎない。

- manager の責務が肥大化してボトルネックになる。
  - 回避策: source 取得・重複判定・翻訳は worker に分ける。

- 翻訳 QA を早く入れすぎると性能目標を壊す。
  - 回避策: Phase 1 では translation QA を必須にしない、または簡易化する。

- Hacker News に引っ張られて一次情報の軸がぶれる。
  - 回避策: judge / dedupe で一次情報優先を固定する。

- `.claude/` と `docs/ai-news-agent_differentiation_strategy.md` は未追跡のまま残っている。
  - 回避策: 意図しない限りコミット対象に含めない。

## 10. 参考（References, optional）

- `https://github.com/akihirookuda95/ai-news-agent/issues/11`
  - 設計フェーズ本体の Issue。

- `https://github.com/akihirookuda95/ai-news-agent/issues/12`
  - 技術選定フェーズの Issue。

- `docs/specs/ai-news-agent-spec.md`
  - 最新の仕様本体。Phase 1 条件とアーキテクチャ前提がある。

関連コミットID（短縮SHA + 1行要約）

- `b2b4841` Phase1向けに仕様書のMVP条件を具体化
- `dac9274` PR #10 を main にマージ
