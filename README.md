# ai-news-agent

AI news and research brief agent that tracks official updates and community signals based on personal interests.

`ai-news-agent` は、ユーザーの関心技術・関心目的に沿って AI 情報を収集し、ノイズを抑えたテーマ別 research brief を生成・蓄積するためのプロジェクトです。

最終的には、公式情報とコミュニティ反応を横断し、ユーザーが「今読むべきもの」「試すべきもの」を判断しやすくする AI intelligence backend を目指します。

## Current Status

現在は、実装前のプロダクト設計フェーズです。

主な作業は次のとおりです。

- 最終プロダクト像から逆算した MVP / MVP-0 の絞り込み
- MVP の機能要件・非機能要件の定義
- manager 主導の controlled multi-agent 構成の最小化

実装コードはまだ source of truth ではありません。

## Product Direction

最上位価値は、完全翻訳そのものではなく、次の 3 点に置いています。

- 重要な AI 情報を見落としにくくすること
- ノイズを抑え、自分に関係ある情報を拾うこと
- 今読むべきもの、試すべきものを判断しやすくすること

最終的には次のような体験を目指します。

- ユーザーの関心技術・関心目的に沿って情報を定期収集する
- 公式情報とコミュニティ反応を横断する
- テーマ別 research brief を Markdown として生成・蓄積する
- 必要に応じて重要記事を翻訳する
- 将来的に通知、検索可能な蓄積データ、対話的な深掘り、音声 digest に拡張する

## MVP Direction

MVP / MVP-0 では、最終像をすべて実装しません。

まずは source と自律性を絞り、次を検証します。

- 限られた公式情報 source から、関心技術に合う重要更新を拾えるか
- ノイズを抑えたテーマ別 research brief を生成できるか
- manager / worker / judge / translation / output の責務境界が過剰ではないか

MVP 初期では、Reddit、X、Zenn、Qiita、dev.to、通知、音声、hosted DB、深い自律探索は対象外です。

## Source of Truth

現行のプロダクト方針は次の文書を基準にします。

- [`docs/README.md`](docs/README.md)
- [`docs/design/product-vision-and-mvp-direction.md`](docs/design/product-vision-and-mvp-direction.md)

過去の仕様・設計メモは `docs/archive/` 配下に退避しています。archive 文書は背景確認用であり、現行方針の source of truth ではありません。

## Repository Notes

- このリポジトリは設計フェーズ中心です。
- 古い `Phase 1 MVP CLI` 前提は復活させません。
- 大きな実装に入る前に、MVP の目的、機能要件、非機能要件を先に確定します。
