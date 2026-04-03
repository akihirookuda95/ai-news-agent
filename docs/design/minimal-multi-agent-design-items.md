# 最小マルチエージェント設計項目メモ

更新日: 2026-04-03

このドキュメントは、Issue #11 で扱う **設計フェーズ** において、`ai-news-agent` を **最小マルチエージェント構成** で実装するために設計すべき項目を整理したもの。

前提:

- 主軸は **読む用途**
- MVP の情報源は **公式ブログ / GitHub Releases / 公式ドキュメント / Hacker News**
- 完全翻訳の対象は **本文 / 見出し / 箇条書き**
- 性能目標は **5記事で2分以内、10記事で3分以内**
- 測定条件は **キャッシュなし / 音声なし / コマンド開始から Markdown 生成完了まで**
- 固定パイプラインではなく **manager 主導の最小マルチエージェント** を採用する

---

## 1. 到達目標

この設計フェーズでは、最終形の階層型マルチエージェントをフル実装する前段として、**最小構成で実際に動く manager 主導型アーキテクチャ** を成立させる。

目指す構成:

- `manager agent`
- `source worker agents` 2〜3 個
- `judge / dedupe agent`
- `translation agent`
- `markdown output layer`

この段階でまだ簡略化してよいもの:

- `translation QA agent` は省略または簡易版
- 音声生成は任意・補助機能
- Reddit / X / dev.to / Zenn は対象外
- MCP サーバー化は後続フェーズ
- 自律的な多段再探索は最小限に留める

---

## 2. 最優先で設計すべき項目

### 2.1 Manager Agent の責務

決めること:

- manager が何を決めるか
- worker に何を渡すか
- どの条件で「収集完了」とみなすか
- 最終出力の責任をどこまで持つか

最低限必要な責務:

- 入力要求の受け取り
- 初期探索計画の作成
- worker への担当割り当て
- 収集結果のレビュー
- 追加探索の要否判断
- 翻訳対象の確定
- 最終的な記事順序と出力内容の決定

出口条件:

- manager の責務が worker と混ざらず説明できる

### 2.2 Source Worker Agents の責務

決めること:

- 何種類の worker を持つか
- 各 worker の担当範囲
- worker が返す出力フォーマット

最小候補:

- `official_blog_worker`
- `github_release_worker`
- `docs_update_worker`
- `hacker_news_worker`

出口条件:

- 各 worker が「何を取りに行くか」「何を返すか」を説明できる

### 2.3 Judge / Dedupe Agent の責務

決めること:

- 重複除去の粒度
- 一次情報優先のルール
- 重要度判定のルール

最低限必要な責務:

- 同一更新・同一話題の統合
- 公式情報を主に残す
- Hacker News は補助情報として扱う
- `高 / 中 / 低` の初期ラベル付け

出口条件:

- どのデータを残し、どのデータを落とすかのルールが文章で定義されている

### 2.4 Translation Agent の責務

決めること:

- 翻訳単位
- chunking 方針
- 完全翻訳を維持する方法

最低限必要な責務:

- 本文 / 見出し / 箇条書きの翻訳
- 技術用語保持
- 要約化の防止
- 表の除外

出口条件:

- 「完全翻訳」の実装条件が説明できる

### 2.5 共有メモリの設計

決めること:

- manager と worker が何を共有するか
- 生本文を共有するか、メタデータだけにするか
- 更新ステータスをどう持つか

推奨方針:

- 共有は **構造化メモリ** を基本にする
- 記事全文は必要時のみ後段で参照する

最低限必要な項目例:

- `id`
- `title`
- `url`
- `sourceType`
- `sourceName`
- `publishedAt`
- `isPrimarySource`
- `topicTags`
- `shortSummary`
- `relevanceScore`
- `status`

出口条件:

- manager が共有メモリだけ見て、次の行動を決められる

### 2.6 Source Normalization / Content Extraction の設計

決めること:

- 各 source worker が取得した生データをどこで正規化するか
- 本文抽出、メタデータ抽出、本文未取得時の扱いをどこで担うか
- `CandidateItem` に入る前に必須とする項目は何か

推奨方針:

- source adapter は取得に専念し、worker または正規化レイヤーで共通形式へ変換する
- 本文抽出とメタデータ抽出は `CandidateItem` 化の前に済ませる
- 抽出失敗時は `status` と失敗理由を残し、judge や manager が扱えるようにする

出口条件:

- source adapter、worker、共有メモリの責務境界が説明できる

---

## 3. 処理フローとして設計すべき項目

### 3.1 標準フロー

最小フロー案:

1. CLI から要求を受け取る
2. manager が探索計画を作る
3. source workers が並列で候補を収集する
4. 各 worker が共有メモリへ候補を登録する
5. judge / dedupe agent が候補群を評価する
6. manager が結果を見て、必要なら追加探索を指示する
7. manager が翻訳対象を確定する
8. translation agent が完全翻訳する
9. output layer が Markdown を生成する
10. 必要なら簡易音声生成へ渡す

出口条件:

- このフローをそのまま実装タスクに落とせる

### 3.2 追加探索の設計

決めること:

- 再探索をどこまで許すか
- 追加探索の停止条件

推奨方針:

- **1 回だけ追加探索を許す** 程度に留める
- 無限ループや深いエージェント探索は避ける

追加探索のトリガー候補:

- 記事数不足
- 特定ソースへの偏り
- 一次情報が足りない

出口条件:

- 「どの条件なら再探索するか」が決まっている

### 3.3 Manager の停止条件 / 成功条件

決めること:

- manager が「これで十分」と判断する条件
- どの状態を全体成功、部分成功、失敗とみなすか
- 記事数不足や一部 source failure があっても返す条件

推奨方針:

- 停止条件は `候補数`、`一次情報比率`、`偏りの少なさ`、`追加探索回数上限` で判断する
- 全体成功は「最低件数を満たし、一次情報が含まれ、Markdown を生成できること」とする
- 部分成功を許し、必要なら不足理由を明記して返す

出口条件:

- manager が探索継続と終了をどう判定するか説明できる

---

## 4. 入出力として設計すべき項目

### 4.1 CLI 入力設計

決めること:

- コマンド形式
- 必須引数
- 任意引数

最低限の入力候補:

- `query`
- `limit`
- `generateAudio`
- `targetSources` または `preset`

出口条件:

- 1回の CLI 実行に必要な入力が定義されている

### 4.2 内部データ構造設計

決めること:

- `NewsRequest`
- `CandidateItem`
- `RankedItem`
- `TranslatedItem`
- `DigestResult`

出口条件:

- source / judge / translate / output の各段で受け渡す型が定義できる

### 4.3 Markdown 出力設計

決めること:

- MVP の最小出力フォーマット
- 記事1本あたりの必須項目
- 重要度表示の位置

最低限必要な出力項目:

- タイトル
- 生成日時
- クエリ
- 記事数
- 各記事の重要度
- 各記事のタイトル
- ソース
- URL
- 日時
- 完全翻訳本文

出口条件:

- 出力テンプレートを見れば、そのまま書き出し実装に入れる

---

## 5. モジュール分割として設計すべき項目

### 5.1 Agent Orchestrator

責務:

- manager と worker の呼び出し順序を制御する
- ラウンド進行を管理する

### 5.2 Source Adapters

責務:

- 公式ブログ取得
- GitHub Releases 取得
- 公式ドキュメント更新取得
- Hacker News 取得

### 5.3 Shared Memory / State Store

責務:

- 候補データの集約
- status 更新
- manager の判断材料保持

### 5.4 Ranking Layer

責務:

- 重要度判定
- 重複除去
- 一次情報優先の整列

### 5.5 Translation Layer

責務:

- 完全翻訳
- chunking
- 技術用語維持

### 5.6 Output Layer

責務:

- Markdown 書き出し
- 将来の音声出力接続

出口条件:

- モジュール分割だけ見れば、実装ファイル構成を決められる

---

## 6. 性能のために設計段階で決めるべきこと

- どの worker を並列実行するか
- 翻訳を何本まで並列で回すか
- 追加探索を最大何ラウンドにするか
- Hacker News の取得件数を何件にするか
- source worker の失敗をどう吸収するか

推奨方針:

- source worker は並列
- 翻訳も並列
- 追加探索は最大 1 ラウンド
- 部分成功を許す

出口条件:

- 5記事 / 10記事の性能目標に対して、どこがボトルネックになるか仮説が立っている

---

## 7. エラー時の設計

決めること:

- どの agent 失敗で全体失敗とするか
- source worker の一部失敗をどう扱うか
- 翻訳失敗記事をどう扱うか

推奨方針:

- source worker の一部失敗は許容する
- judge が使える候補だけで継続する
- 翻訳失敗記事は原文混在にせず、除外または失敗明記に寄せる
- manager が最終的に「十分な結果か」を判定する

出口条件:

- エラー時の挙動がユーザー視点で説明できる

---

## 8. この設計フェーズで決めきらなくてよいこと

- MCP サーバー化の詳細
- 本格的な translation QA agent の導入
- Reddit の導入方法
- X の扱い
- 音声品質改善
- 高度な role-based briefing
- 深い topic clustering

---

## 9. 設計フェーズの成果物

Issue #11 で最終的にほしい成果物は次のとおり。

- 最小マルチエージェント構成図
- manager / worker / judge / translation の責務定義
- 共有メモリのデータ構造案
- 標準処理フロー
- source normalization / content extraction の責務定義
- manager の停止条件 / 成功条件
- CLI 入力仕様
- Markdown 出力仕様
- エラー設計
- 並列化と追加探索の方針

---

## 10. 技術選定フェーズとの境界

設計フェーズでは **どの agent が何をするか** を決める。
技術選定フェーズでは **それを何で実装するか** を決める。

設計フェーズで先に固めること:

- `official_blog_worker` が必要
- `github_release_worker` が必要
- `docs_update_worker` が必要
- `hacker_news_worker` が必要
- `shared memory` が必要
- `manager` のラウンド制御が必要

技術選定フェーズに渡すこと:

- 各 worker をどの取得手段で作るか
- shared memory を in-memory にするか永続化するか
- 翻訳にどのモデル/APIを使うか
- CLI をどのライブラリで組むか

---

## 11. 設計フェーズの進め方

推奨順序:

1. manager の責務設計
2. source workers の責務設計
3. 共有メモリ設計
4. source normalization / content extraction 設計
5. manager の停止条件 / 成功条件設計
6. 標準処理フロー設計
7. judge / dedupe 設計
8. translation 設計
9. Markdown 出力設計
10. エラー設計
11. 性能・追加探索設計

この順に進めると、最小マルチエージェント構成としての不確実性を減らしながら実装に近づける。
