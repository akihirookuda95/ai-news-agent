# Docs

このディレクトリでは、`ai-news-agent` のプロダクト開発に使う現役ドキュメントと、過去の設計資料を分けて管理する。

## Active Source of Truth

現時点のプロダクト開発の source of truth は次の文書である。

- `docs/design/product-vision-and-mvp-direction.md`
- `docs/design/mvp-requirements.md`

これらの文書を、最終プロダクト像、価値定義、MVP の絞り込み方針、MVP 要件の基準として扱う。

## Archive

`docs/archive/` 配下の文書は過去の設計資料であり、現行方針の source of truth ではない。

archive 文書を参照してよいケース:

- 過去の意思決定の背景を確認する
- 旧設計から再利用できる論点を探す
- 現行方針への変更理由を確認する

archive 文書を参照してはいけないケース:

- 現行の MVP スコープを決める
- 現行のプロダクト制約を決める
- 現行の実装方針を旧仕様で上書きする

archive 文書と現行 source of truth が矛盾する場合は、現行 source of truth を優先する。

## Current Focus

現在の焦点は、最終プロダクト像から逆算して MVP / MVP-0 の目的、機能要件、非機能要件を絞り込むことである。

実装コードはまだ source of truth とみなさない。
