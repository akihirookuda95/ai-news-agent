# MVP Requirements

作成日: 2026-05-04

## 目的

`ai-news-agent` の MVP で実装・検証する範囲を定義する。

この文書は、最終プロダクト像を定義した `docs/design/product-vision-and-mvp-direction.md` を前提に、MVP を過剰に広げないための段階的な要件を整理する。

## 前提

最終プロダクト像では、`ai-news-agent` はユーザーの関心技術・関心目的に沿って公式情報とコミュニティ反応を継続収集し、ノイズを抑えた research brief を生成・蓄積する AI intelligence backend を目指す。

ただし、最終像を最初の MVP に入れすぎると、認知負荷・実装量・失敗要因が増えすぎる。

そのため、MVP は次の段階に分ける。

- `MVP-0`: 公式ブログだけで、読みやすい Markdown brief を生成できるか検証する。
- `MVP-1`: GitHub Releases / changelog を追加する。
- `MVP-2`: Hacker News を補助情報として追加する。

公式ドキュメント更新は、MVP-0 / MVP-1 / MVP-2 には含めず、後続で扱う。

## MVP-0 の目的

MVP-0 の目的は次である。

> 公式ブログからユーザーの関心技術に近い情報を収集し、読みやすい Markdown research brief として出力できるかを検証する。

MVP-0 で検証する価値:

- 公式情報 source から関心テーマに合う候補を拾えること。
- 拾った情報を research brief として読める形にできること。
- manager / source worker / translation / output の責務境界が過剰ではないこと。

MVP-0 で検証しない価値:

- 複数 source 横断で見落としを減らせるか。
- Hacker News などコミュニティ反応を扱えるか。
- GitHub Releases / changelog を扱えるか。
- 公式 docs 更新を扱えるか。
- 高度な ranking / judging ができるか。

## 段階的なスコープ

### MVP-0

最初に実装・検証する最小単位。

対象 source:

- 公式ブログ

初期の公式ブログ対象:

- OpenAI
- Anthropic
- LangChain
- LangGraph

構成:

- `manager`
- `official_blog_worker`
- URL 重複除去
- translation layer
- markdown output layer
- minimal shared state

やらないこと:

- GitHub Releases / changelog
- 公式ドキュメント更新
- Hacker News
- Reddit
- X
- Zenn / Qiita
- dev.to
- 通知
- 音声 digest
- hosted DB
- Web UI
- 定期実行
- 追加探索
- 深い自律探索
- relevance score
- importance score
- 翻訳 QA agent

### MVP-1

MVP-0 の次に追加する。

追加 source:

- GitHub Releases / changelog

初期対象:

- Codex

目的:

- 公式ブログ以外の公式更新を扱えるか検証する。
- GitHub Releases / changelog を official update source として取り込めるか検証する。

### MVP-2

MVP-1 の次に追加する。

追加 source:

- Hacker News

初期の検索条件候補:

- AI Agent
- RAG
- LLM
- LLM Wiki
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

目的:

- Hacker News を補助情報として扱えるか検証する。
- 公式情報とは別枠で、コミュニティ反応や話題化の兆候を出せるか検証する。

MVP-2 でも重要コメント要約は行わない。

## MVP-0 Scope

### Article Limits

MVP-0 の記事数上限は次とする。

- 全体上限: 5件
- 公式ブログ: 最大5件

この上限は、全文翻訳の負荷と Markdown の読みやすさを制御するために置く。

MVP-1 以降の記事数上限は、source 追加時に再定義する。

### In Scope

- 固定された公式ブログ source の並列収集
- metadata 取得
- 本文抽出
- URL 重複除去
- 出力対象記事の本文翻訳
- Markdown research brief 生成
- source ごとの取得件数ログ
- source ごとの失敗理由ログ
- 翻訳失敗記事の原文リンクと失敗理由表示

### Out of Scope

- source の自動選択
- 関心技術に応じた動的 query 生成
- GitHub Releases / changelog
- 公式ドキュメント更新
- Hacker News
- 追加探索
- 複数ラウンドの深掘り調査
- タイトル類似重複判定
- relevance score
- importance score
- 賢い ranking / judging
- 翻訳 QA agent
- 通知
- 音声 digest
- hosted DB
- Web UI
- 定期実行

## MVP-0 機能要件

### FR-1: 固定された公式ブログ source を並列に実行できる

manager は、MVP-0 で定義された公式ブログ source を並列に呼び出せること。

MVP-0 では、manager が source を動的に選択しない。

### FR-1.5: shared state は CandidateItem と SourceRunResult で構成する

MVP-0 の shared state は、次の 2 種類を中心にする。

- `CandidateItem`
- `SourceRunResult`

`CandidateItem` は、記事候補 1 件を表す。

最低限の項目:

- `id`
- `title`
- `url`
- `source`
- `sourceType`
- `publishedAt`
- `summary`
- `contentRef`
- `status`
- `failureReason`

`SourceRunResult` は、source ごとの実行結果を表す。

最低限の項目:

- `source`
- `sourceType`
- `status`
- `fetchedCount`
- `candidateCount`
- `failureReason`
- `candidates`

本文全文や翻訳本文は、shared state に直接持たない。

本文は `contentRef` で参照できる形にする。

翻訳結果は translation layer / output layer の受け渡しで扱い、MVP-0 の manager 判断用 shared state には含めない。

### FR-2: official_blog_worker が metadata と本文を取得できる

`official_blog_worker` は、担当 source から記事候補を取得し、`SourceRunResult` を返すこと。

`SourceRunResult` の中に `CandidateItem[]` を含める。

理由:

- source ごとの成功 / 失敗と候補一覧をまとめて扱える。
- manager が `SourceRunResult[]` を集約しやすい。
- 部分成功や失敗理由を source 単位で扱いやすい。

想定 schema:

```ts
type SourceRunResult = {
  source: string;
  sourceType: "official_blog";
  status: "success" | "partial_success" | "failed";
  fetchedCount: number;
  candidateCount: number;
  failureReason?: string;
  candidates: CandidateItem[];
};

type CandidateItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: "official_blog";
  publishedAt?: string;
  summary?: string;
  contentRef?: string;
  status: "ready" | "extraction_failed" | "skipped";
  failureReason?: string;
};
```

`CandidateItem` は、少なくとも次を表すこと。

- title
- url
- source
- source type
- published date
- extracted body
- summary

短い概要は、`official_blog_worker` が本文抽出後に本文から生成する。

理由:

- `summary` は `CandidateItem` に含まれるため、translation 前にも扱える。
- output layer を太らせずに済む。
- translation layer を翻訳責務に集中させられる。

本文抽出に失敗した場合は、候補自体を破棄するか、失敗理由を残す。

### FR-3: URL 重複を除去できる

dedupe layer は、同一 URL の重複候補を除去すること。

MVP-0 では、タイトル類似や意味的重複までは扱わない。

### FR-4: 出力対象記事を翻訳できる

translation layer は、出力対象になった記事について本文を日本語に翻訳すること。

MVP-0 では、翻訳 QA agent は導入しない。

翻訳対象:

- 見出し
- 本文
- 箇条書き

翻訳しない対象:

- 表
- コードブロック

理由:

- 技術記事のコードブロックを翻訳すると内容が壊れやすい。
- 表は構造が崩れやすい。
- 見出し・本文・箇条書きを翻訳できれば、読み物として成立する。

translation layer は `TranslationResult` を返す。

`TranslationResult` には、翻訳本文だけでなく `status` と `failureReason` を含める。

理由:

- 翻訳失敗記事を Markdown に出す要件がある。
- 翻訳失敗理由を output layer が扱える必要がある。
- `CandidateItem` を翻訳結果で太らせずに済む。

想定 schema:

```ts
type TranslationResult = {
  candidateId: string;
  status: "success" | "failed" | "skipped";
  translatedText?: string;
  failureReason?: string;
};
```

translation layer の input は、`candidateId` と本文参照または本文を含む構造にする。

MVP-0 では、translation layer が `contentRef` から本文を読むか、呼び出し元が本文を解決して渡すかは実装時に決めてよい。

ただし output layer へ渡す時点では、`CandidateItem` と `TranslationResult` を `candidateId` で対応付けられること。

### FR-5: Markdown brief を生成できる

output layer は、公式ブログ記事を読みやすい Markdown research brief として生成すること。

MVP-0 の Markdown は、source 別構成にする。

基本テンプレート:

```md
# AI Research Brief

## Run Summary

- Generated at:
- Target sources:
- Total articles:
- Successful sources:
- Failed sources:

## OpenAI

### 1. Article Title

- Source:
- URL:
- Published:
- Summary:

本文翻訳...

## Anthropic

### 1. Article Title

- Source:
- URL:
- Published:
- Summary:

本文翻訳...

## LangChain

### 1. Article Title

- Source:
- URL:
- Published:
- Summary:

本文翻訳...

## LangGraph

### 1. Article Title

- Source:
- URL:
- Published:
- Summary:

本文翻訳...

## Failures

- Source:
- Reason:
```

各記事には、少なくとも次を含める。

- タイトル
- URL
- source
- published date
- 短い概要
- 本文翻訳

### FR-6: 部分成功で Markdown を生成できる

一部 source が失敗しても、成功した source の情報で Markdown を生成すること。

失敗 source は Markdown 末尾または実行サマリに明記する。

## MVP-0 非機能要件

### NFR-1: source 取得の安定性

MVP-0 では source 取得の安定性を重視する。

一部 source が失敗しても全体を失敗させず、部分成功として扱えること。

### NFR-2: Markdown の読みやすさ

生成される Markdown は research brief として読めること。

単なる URL リストではなく、短い概要と本文翻訳を含む読み物にする。

### NFR-3: 時間制限は置かない

MVP-0 では、5記事2分以内 / 10記事3分以内のような時間目標は置かない。

品質を優先する。

ただし、将来の性能目標設定のため、実行時間を計測できる余地を残す。

### NFR-4: 翻訳失敗時に全体失敗しない

1記事の翻訳失敗で全体を失敗させない。

翻訳できなかった記事は、原文リンクと失敗理由を表示する。

### NFR-5: source ごとのログを残す

MVP-0 では、少なくとも次を残す。

- source ごとの取得件数
- source ごとの失敗理由

記事ごとの細かい処理ステータスは MVP-0 必須ではない。

## MVP-0 成功条件

MVP-0 は、次を満たしたら成功とみなす。

- OpenAI / Anthropic / LangChain / LangGraph の公式ブログ source から候補を取得できる。
- 成功した source の結果だけで Markdown を生成できる。
- Markdown が research brief として読める。
- 各記事にタイトル、URL、source、published date、短い概要、本文翻訳が含まれる。
- URL 重複が除去されている。
- source 失敗や翻訳失敗があっても、失敗理由が分かる。

## 主要なトレードオフ

### MVP-0 は公式ブログだけに絞る

Q2 では GitHub Releases、公式 docs 更新、Hacker News も MVP に含めたい意向があった。

しかし、それらを同時に入れると、MVP がほぼ完成像の初期版になり、認知負荷・実装量・失敗要因が増えすぎる。

そのため、MVP-0 は公式ブログだけに絞る。

### 全文翻訳するが記事数を絞る

Q3 と Q4 では全記事本文翻訳を重視している。

一方で、これは処理時間とコストを増やす。

そのため、MVP-0 では全体上限を 5 件に絞る。

### source 別構成を採用する

最終像ではテーマ別 research brief を目指す。

MVP-0 では OpenAI / Anthropic / LangChain / LangGraph という source が明確なため、まず source 別構成を採用する。

source 別にすることで、取得結果と失敗箇所を確認しやすくする。

## 後続フェーズ

### MVP-1 で決めること

- Codex GitHub Releases / changelog の取得方法
- GitHub Releases worker の責務
- 公式ブログ記事と release 情報の出力上の並べ方
- MVP-1 の記事数上限

### MVP-2 で決めること

- Hacker News の検索条件
- HN を別枠で出すか、公式情報に紐付けるか
- コメント数・ポイント・URL 一致をどう扱うか
- MVP-2 の記事数上限

## 未決事項

N/A

## 次に決めること

1. MVP-0 の実装設計
2. source adapter と official_blog_worker の責務境界
3. contentRef の実体
4. Markdown 出力ファイルの保存先と命名規則
