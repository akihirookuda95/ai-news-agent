# Project Pause and Validation

作成日: 2026-05-04

## 目的

`ai-news-agent` の開発を一旦停止する理由と、将来再開する場合の判断条件を記録する。

この文書は、実装を中断するための判断ログであり、`docs/design/product-vision-and-mvp-direction.md` や `docs/design/mvp-requirements.md` を即座に置き換えるものではない。

## 結論

`ai-news-agent` の実装は一旦停止する。

理由は、当初想定していた主な価値の多くが、ChatGPT / Gemini の web 検索、Deep Research、または Feedly のような RSS reader で代替できる可能性が高いと判断したためである。

この状態で実装を進めると、作る意味が弱いまま source adapter や translation pipeline の保守コストを抱えるリスクがある。

## 停止する理由

### 1. 網羅的な検索は ChatGPT / Gemini で代替できる

AI 関連ニュースを広く検索し、source 付きで要約する用途は、ChatGPT の web 検索や Gemini Deep Research でかなり代替できる。

そのため、`ai-news-agent` が「ChatGPT / Gemini より広く賢く AI ニュースを探す」方向で差別化するのは難しい。

### 2. 定期的なニュース取得は RSS reader で代替できる

公式ブログや技術ブログを定期的に追うだけなら、Feedly などの RSS reader で代替できる。

MVP-0 の対象 source は OpenAI / Anthropic / LangChain / LangGraph の公式情報に絞っているため、source 監視そのものは専用アプリを作らなくても成立する可能性が高い。

### 3. 残る差別化が実装・保守コストに見合うか不明

`ai-news-agent` に残り得る差別化は、次のようなものだった。

- source を固定できること
- Markdown として蓄積できること
- 日本語翻訳を自分のルールで制御できること
- 出力形式を安定させられること

ただし、これらが source adapter、本文抽出、翻訳、Markdown 出力、将来の保守に見合うほど強い価値かは未確認である。

### 4. 失敗理由の可視化はユーザー価値ではない

取得失敗や翻訳失敗の理由を記録することは、内部の品質保証やデバッグには役立つ。

しかし、それ自体はユーザー価値ではない。

本来の価値は、ユーザーが「読みたい情報を安定して読めること」であり、失敗理由の可視化を差別化の中心に置くべきではない。

## 一旦採用しない価値定義

次の方向では進めない。

```text
ChatGPT / Gemini より広く、賢く、網羅的に AI ニュースを検索する。
```

理由:

- 汎用 AI 検索や Deep Research の進化が速い。
- 自作するほどの明確な優位性を出しにくい。
- source 追加や検索品質改善の保守コストが高くなりやすい。

## 残る可能性のある価値

将来再開する場合、価値の中心は次に寄せる。

```text
決めた公式 source を、毎回同じ手順で収集し、
読み切れる日本語 Markdown brief として保存する個人用 pipeline。
```

ただし、この価値が十分に強いかは未検証である。

## 再開条件

次の不満が実運用で繰り返し発生した場合に再開を検討する。

- ChatGPT / Gemini の検索結果で source が期待と大きくずれる。
- web 検索や Deep Research の出力が安定しない。
- 完全翻訳ではなく要約になってしまう。
- 長文記事の翻訳が途中で終わる。
- 後から見返すための Markdown 蓄積が不便である。
- Feedly などの RSS reader では、読むための日本語化や brief 化が十分でない。
- 毎回 prompt を調整する負荷が継続的に大きい。

目安として、2 週間程度の通常運用で上記の不満が 3 回以上起きた場合に再開を検討する。

## 再開する場合の方向性

再開する場合も、いきなり現在の MVP-0 実装に戻らない。

まず次のどちらかを行う。

### 案 A: ChatGPT / Gemini / Feedly との比較メモを作る

比較軸:

- source 固定
- 出力形式の安定性
- 完全翻訳の安定性
- Markdown 蓄積
- 手動 prompt 調整の負荷
- 保守コスト

### 案 B: 極小 PoC だけ作る

範囲:

- source は 1 つだけ
- 記事は 1 件だけ
- RSS 取得と Markdown 保存だけ
- LangGraph.js、translation、multi-source adapter は入れない

目的:

- 自作 pipeline が本当に日常利用の負荷を下げるかだけを確認する。

## 現時点でやらないこと

- MVP-0 の実装 scaffold 作成
- source adapter 実装
- LangGraph.js graph 実装
- translation layer 実装
- Markdown output layer 実装
- MCP server 化
- hosted DB
- 通知
- 音声

## 関連ドキュメント

- `docs/design/product-vision-and-mvp-direction.md`
- `docs/design/mvp-requirements.md`
- `docs/design/mvp-0-implementation-design.md`
