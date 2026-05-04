# MVP Requirements

作成日: 2026-05-04

## 目的

`ai-news-agent` の MVP で実装・検証する範囲を、Q1〜Q5 の回答に基づいて定義する。

この文書は、最終プロダクト像を定義した `docs/design/product-vision-and-mvp-direction.md` を前提に、MVP の目的、機能要件、非機能要件、スコープ外を具体化する。

## 前提

最終プロダクト像では、`ai-news-agent` はユーザーの関心技術・関心目的に沿って公式情報とコミュニティ反応を継続収集し、ノイズを抑えた research brief を生成・蓄積する AI intelligence backend を目指す。

ただし MVP では、最終像のすべてを実装しない。

MVP では、次を先に検証する。

> 複数の公式系 source と Hacker News から、ユーザーの関心技術に近い情報を収集し、source 別に整理された読みやすい Markdown research brief として出力できるか。

## Q1〜Q5 からの結論

### Q1: MVP で検証したい価値

MVP の主目的は、**関心テーマに合う公式情報を拾い、research brief として読める形にすること**である。

重要な判断:

- 最初に成功確認したいことは、公式情報 source から関心テーマに合う候補を拾えること。
- MVP の失敗条件は、情報はあるが research brief として読みにくいこと。
- 最初に作るべき出力は、research brief。
- ranking / judging を賢くしすぎることは避ける。
- 最優先の検証価値は、brief として読めること。

### Q2: MVP の対象 source

MVP は、公式ブログ 1 系統だけの超小型 MVP-0 ではなく、**複数 source 横断型 MVP** とする。

対象 source:

- 公式ブログ
- GitHub Releases / changelog
- 公式ドキュメント更新
- Hacker News

初期の公式ブログ対象:

- OpenAI
- Anthropic
- LangChain / LangGraph

将来的には、固定リストではなくユーザーの関心技術リストから対象 source を選べるようにする。

source 選定では、実装容易性より **ユーザーの関心技術に近いこと**を優先する。

### Q3: MVP の出力形式

MVP の出力は、**source 別に整理した 15〜30 分で読める詳しめの Markdown research brief** とする。

出力構造:

- 公式ブログ
- GitHub Releases / changelog
- 公式ドキュメント更新
- Hacker News

記事ごとの最低項目:

- タイトル
- URL
- source
- published date
- 短い概要
- 本文全文翻訳

Hacker News の扱い:

- 記事補足としてコメント数や反応を出す。
- 公式情報とは別枠のコミュニティ反応としても出す。
- MVP では重要コメント要約までは行わない。

注意:

- 以前の product vision では「テーマ別 research brief」を重視していた。
- MVP では、認知負荷と実装単位を抑えるため、まず source 別を主構造にする。
- 将来的には source 別からテーマ別 brief へ寄せる。

### Q4: MVP の機能要件

MVP の基本フローは次とする。

```text
fixed sources
→ manager が並列実行
→ source workers が metadata と本文を取得
→ URL 重複を除去
→ 出力対象記事を全文翻訳
→ source 別 Markdown brief を生成
```

各責務:

- manager
  - 固定 source を並列に呼ぶ。
  - 結果を集約する。
  - MVP では source 選択や追加探索はしない。

- source worker
  - URL / metadata を取得する。
  - 本文抽出まで行う。
  - source ごとの relevance 判定はしない。

- judge / dedupe
  - URL 重複だけ除去する。
  - タイトル類似重複、relevance score、importance score は MVP では行わない。

- translation
  - 出力対象の全記事を本文翻訳する。
  - 翻訳品質チェック agent は MVP では入れない。

- output layer
  - source 別 brief を生成する。
  - 各記事の短い概要を書く。
  - 各記事の全文翻訳を書く。
  - 実行ログ / 失敗理由 / source 別取得状況を本文の主コンテンツには含めない。

### Q5: MVP の非機能要件

MVP で特に壊したくない品質:

- source 取得が安定していること。
- Markdown brief として読みやすいこと。

処理時間:

- MVP では時間制限を置かず、品質を優先する。
- ただし、将来の性能改善のために処理時間は計測できる設計にする。

source worker 失敗時:

- 成功した source だけで Markdown を出す。
- 失敗した source は末尾に明記する。

翻訳失敗時:

- 翻訳失敗記事は、原文リンクと失敗理由だけ出す。
- MVP では翻訳失敗によって全体失敗にはしない。

ログ / 再現性:

- source ごとの取得件数を残す。
- source ごとの失敗理由を残す。
- 記事ごとの詳細ステータスまでは MVP 必須にしない。

## MVP Scope

### In Scope

- 固定 source の並列収集
- 公式ブログ収集
- GitHub Releases / changelog 収集
- 公式ドキュメント更新の収集
- Hacker News の収集
- metadata 取得
- 本文抽出
- URL 重複除去
- 出力対象記事の全文翻訳
- source 別 Markdown research brief 生成
- source ごとの取得件数ログ
- source ごとの失敗理由ログ
- 翻訳失敗記事の原文リンクと失敗理由表示

### Out of Scope

- source の自動選択
- 関心技術に応じた動的 query 生成
- 追加探索
- 複数ラウンドの深掘り調査
- タイトル類似重複判定
- relevance score
- importance score
- 賢い ranking / judging
- 翻訳 QA agent
- 重要 HN コメント要約
- 通知
- 音声 digest
- hosted DB
- Web UI
- 定期実行
- Reddit
- X
- Zenn / Qiita
- dev.to

## 機能要件

### FR-1: 固定 source を並列に実行できる

manager は、MVP で定義された固定 source worker を並列に呼び出せること。

MVP では、manager が source を動的に選択しない。

### FR-2: source worker が metadata と本文を取得できる

各 source worker は、担当 source から記事候補を取得し、少なくとも次を返すこと。

- title
- url
- source
- source type
- published date
- extracted body

本文抽出に失敗した場合は、候補自体を破棄するか、失敗理由を残す。

### FR-3: URL 重複を除去できる

judge / dedupe layer は、同一 URL の重複候補を除去すること。

MVP では、タイトル類似や意味的重複までは扱わない。

### FR-4: 出力対象記事を全文翻訳できる

translation layer は、出力対象になった全記事について本文を日本語に翻訳すること。

MVP では、翻訳 QA agent は導入しない。

### FR-5: source 別 Markdown brief を生成できる

output layer は、source 別に整理された Markdown research brief を生成すること。

各記事には、少なくとも次を含める。

- タイトル
- URL
- source
- published date
- 短い概要
- 本文全文翻訳

### FR-6: Hacker News の反応を出力できる

Hacker News については、記事ごとのコメント数や反応を出力できること。

MVP では、重要コメントの要約は行わない。

### FR-7: 部分成功で Markdown を生成できる

一部 source が失敗しても、成功した source の情報で Markdown を生成すること。

失敗 source は Markdown 末尾または実行サマリに明記する。

## 非機能要件

### NFR-1: source 取得の安定性

MVP では source 取得の安定性を重視する。

一部 source が失敗しても全体を失敗させず、部分成功として扱えること。

### NFR-2: Markdown の読みやすさ

生成される Markdown は、15〜30 分で読める research brief として成立すること。

単なる URL リストではなく、source 別に読める構成にする。

### NFR-3: 時間制限は置かない

MVP では、5記事2分以内 / 10記事3分以内のような時間目標は置かない。

品質を優先する。

ただし、将来の性能目標設定のため、実行時間を計測できる余地を残す。

### NFR-4: 翻訳失敗時に全体失敗しない

1記事の翻訳失敗で全体を失敗させない。

翻訳できなかった記事は、原文リンクと失敗理由を表示する。

### NFR-5: source ごとのログを残す

MVP では、少なくとも次を残す。

- source ごとの取得件数
- source ごとの失敗理由

記事ごとの細かい処理ステータスは MVP 必須ではない。

## 成功条件

MVP は、次を満たしたら成功とみなす。

- 複数の固定 source から候補を取得できる。
- 成功した source の結果だけで Markdown を生成できる。
- source 別に整理された brief として読める。
- 各記事にタイトル、URL、source、published date、短い概要、本文翻訳が含まれる。
- URL 重複が除去されている。
- Hacker News の反応が、補助情報として確認できる。
- source 失敗や翻訳失敗があっても、失敗理由が分かる。

## 主要なトレードオフ

### source は広め、judge は単純

Q2 では source を広く取りたい意向が強い一方で、Q1 と Q4 では ranking / judging を賢くしすぎたくない意向がある。

そのため MVP では、source は複数扱うが、judge は URL 重複除去に留める。

### source 別 brief を先に作る

最終像ではテーマ別 research brief を目指すが、MVP では source 別のほうが実装しやすく、取得結果の確認もしやすい。

そのため MVP では source 別を採用する。

### 全文翻訳するが時間目標は置かない

Q3 と Q4 では全記事全文翻訳を重視している。

一方で、これは処理時間とコストを増やす。

そのため MVP では時間目標を置かず、まず品質と読みやすさを優先する。

## 未決事項

- 出力対象の記事数上限
  - なぜ重要か: source を広く扱い、全記事全文翻訳するため、上限がないと処理時間とコストが膨らむ。
  - 決める必要があること: source ごとの最大件数、全体の最大件数。

- 短い概要をどこで生成するか
  - なぜ重要か: source worker が作るか、translation / output layer が作るかで責務が変わる。
  - 決める必要があること: metadata 由来の概要にするか、本文から生成するか。

- 公式ドキュメント更新の取得方法
  - なぜ重要か: docs 更新は差分検出が難しく、MVP の実装量を増やしやすい。
  - 決める必要があること: changelog / release notes に限定するか、docs ページ更新まで見るか。

- Hacker News と公式情報の紐付け方法
  - なぜ重要か: HN を補助情報として出すには、公式情報との関連付けが必要になる可能性がある。
  - 決める必要があること: HN を別枠で出すか、URL 一致時だけ記事補足にするか。

- 翻訳対象の厳密な範囲
  - なぜ重要か: 全文翻訳の対象に、表・コードブロック・引用・コメントなどを含めるかで品質と実装が変わる。
  - 決める必要があること: 本文内のどの要素を翻訳し、どの要素を保持するか。

## 次に決めること

1. source ごとの記事数上限
2. MVP の固定 source リスト
3. 公式ドキュメント更新の取得範囲
4. Markdown output template
5. MVP の shared state schema
6. source worker result schema
7. translation input / output schema
