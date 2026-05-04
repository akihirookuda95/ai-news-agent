# AGENTS.md

## 目的

`ai-news-agent` を、ユーザーの関心技術・関心目的に沿って AI 情報を継続収集し、ノイズを抑えた research brief を生成・蓄積するプロダクトとして扱え。

最終的には、公式情報とコミュニティ反応を横断し、ユーザーが「今読むべきもの」「試すべきもの」を判断しやすくする AI intelligence backend を目指す。

## 現在のフェーズ

このリポジトリは、現在次の段階にある。

- 最終プロダクト像から逆算した MVP / MVP-0 の絞り込み
- MVP の機能要件・非機能要件の再定義
- manager 主導の controlled multi-agent 構成の最小化

実装コードはまだ source of truth とみなすな。

## Source of Truth

現時点の source of truth は次の文書である。

- `docs/README.md`
- `docs/design/product-vision-and-mvp-direction.md`
- `docs/design/mvp-requirements.md`

`docs/archive/` 配下の文書は過去の設計資料であり、現行方針の source of truth ではない。

archive 文書と現行 source of truth が矛盾する場合は、必ず現行 source of truth を優先しろ。

## プロダクト制約

- 最上位価値は、完全翻訳そのものではなく、情報発見・ノイズ低減・自分向け relevance 判断に置け。
- 主用途は読むこととし、音声ファーストにはするな。
- 最終像では広い source を扱える余地を残すが、MVP / MVP-0 では source を絞れ。
- MVP-0 では、公式ブログだけを対象 source として扱う。
- MVP-0 の公式ブログ対象は OpenAI / Anthropic / LangChain / LangGraph とする。
- MVP-0 では、GitHub Releases / changelog、公式ドキュメント更新、Hacker News、Reddit、X、Zenn、Qiita、dev.to、通知、音声、hosted DB、深い自律探索は対象外にしろ。
- MVP-0 の出力は Markdown research brief とし、出力対象記事は本文翻訳する。
- MVP-0 では時間制限を置かず、source 取得の安定性と Markdown の読みやすさを優先しろ。
- MVP-0 では ranking / judging を賢くしすぎず、URL 重複除去に留めろ。

## 設計原則

- アーキテクチャは manager 主導の controlled multi-agent として扱え。
- agent 間の受け渡しは自由文ではなく、構造化された shared state を優先しろ。
- source adapter、normalization、ranking / judging、translation、output の責務を分離しろ。
- manager を太らせるな。manager は source 選択、進行管理、停止判定、追加調査判断、翻訳対象確定に寄せろ。
- 通常 digest では制御された範囲で動かし、深掘り時だけ自律性を上げろ。
- 低コストな判断は agent が進めてよいが、コスト・時間・スコープが大きい判断はユーザーに確認しろ。
- 仕様や docs に反映されていない推測ベースの機能を導入するな。

## 作業ルール

- アーキテクチャ、プロダクト像、MVP スコープを変える前に、関連 docs を先に更新しろ。
- 現行方針を確認するときは、まず `docs/design/product-vision-and-mvp-direction.md` と `docs/design/mvp-requirements.md` を参照しろ。
- archive 文書から判断を復活させる場合は、現行 source of truth との整合理由を明記しろ。
- `.claude/` のような無関係なファイルは、明示的な依頼がない限りコミットするな。
- 古い `Phase 1 MVP CLI` 前提を復活させるな。
- 実装時は、責務の明確さ、テストしやすさ、ノイズ低減、relevance 判断の説明可能性を優先しろ。
- このプロジェクトを通して学んだことが発生したら、現行 docs または archive ではない適切な dev notes に記録しろ。

## 提案時のレビュー補助

MVP-0 の設計・実装方針を提案するときは、ユーザーがレビューしやすいように、原則として次の形式で提示しろ。

```text
提案:
理由:
MVP-0に必要な理由:
壊れやすい場所:
後からsource追加する場合の変更箇所:
後回しにするもの:
あなたのレビュー観点:
```

ユーザーに求めるレビュー観点は、次の 3 点に絞れ。

- MVP-0 に本当に必要か。
- 壊れやすい場所が許容できるか。
- 後から source を追加するときの変更箇所が許容できるか。

責務分離、schema 設計、失敗時の処理、実装上の壊れやすさは、Codex 側が説明責任を持って整理しろ。

## 近い将来に必要な構成要素

- `manager agent`
- `source worker agents`
- `judge / dedupe layer`
- `translation layer`
- `markdown output layer`
- `shared state`

大きな実装に入る前に、次を MVP / MVP-0 の範囲に絞って詰めろ。

- MVP / MVP-0 の目的
- MVP の機能要件
- MVP の非機能要件
- manager の責務
- source worker の境界
- shared state schema
- ranking / relevance 判断
- markdown output format
- error handling
