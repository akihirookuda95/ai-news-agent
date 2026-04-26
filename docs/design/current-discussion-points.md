# ai-news-agent 再開時の議論論点

作成日: 2026-04-26

## 目的

`ai-news-agent` の開発再開にあたり、既存の設計メモをいきなり修正せず、まず現在議論すべき論点だけを整理する。

このファイルは、次の文書を読み直したうえでの議論用メモである。

- `docs/specs/ai-news-agent-spec.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`

## 現時点で維持する前提

- 主用途は読むこと。
- MVP の情報源は公式ブログ、GitHub Releases / changelog、公式ドキュメント更新、Hacker News。
- Reddit、X、dev.to、Zenn は最小スコープ外。
- 完全翻訳の対象は本文、見出し、箇条書き。
- 表とコードブロックは翻訳しない。
- 性能目標は 5 記事 2 分以内、10 記事 3 分以内。
- 測定範囲はコマンド開始から Markdown 生成完了まで。
- キャッシュなし、音声なしを基準にする。
- manager 主導の最小マルチエージェント構成を目指す。

## 今議論するべき論点

### 1. Manager の責務

決めること:

- manager が持つ判断権限の範囲。
- worker、judge、translation、output に任せる範囲。
- manager が停止判定と最終確定だけを持つ薄い orchestrator でよいか。

この論点を先に決める理由:

- manager が太ると、後続の worker / judge / output の責務が曖昧になるため。

### 2. Source Worker の最小構成

決めること:

- worker を何個に分けるか。
- `official_blog_worker`、`github_release_worker`、`docs_update_worker`、`hacker_news_worker` をそのまま分けるか。
- 公式ブログと公式ドキュメントをまとめた `official_source_worker` にするか。

この論点を先に決める理由:

- worker 境界が決まらないと、source adapter、normalization、shared memory の責務が決まらないため。

### 3. Shared Memory の最小 schema

決めること:

- `CandidateItem` に必須とする項目。
- 本文を shared memory に持つか、本文参照だけを持つか。
- `status` と `failureReason` の扱い。
- manager が shared memory だけを見て次の判断をできるか。

この論点を先に決める理由:

- agent 間の受け渡しを自由文にしないため。

### 4. Normalization / Content Extraction の境界

決めること:

- source adapter は取得だけにするか。
- worker が正規化まで行うか。
- 本文抽出を worker 側に置くか、共通 extraction layer に置くか。
- 本文抽出失敗時に候補を残すか落とすか。

この論点を先に決める理由:

- ソースごとの処理差分をどこに閉じ込めるかが実装構造に直結するため。

### 5. Manager の停止条件 / 成功条件

決めること:

- 何件集まれば収集完了とみなすか。
- 一次情報比率を条件に入れるか。
- 追加探索を最大 1 回にするか。
- 部分成功として返してよい条件。

この論点を先に決める理由:

- 無制限な再探索や、記事数だけを満たす低品質な出力を避けるため。

### 6. Judge / Dedupe の選別ルール

決めること:

- 同一更新、同一話題、同一 URL の扱い。
- 公式情報と Hacker News が同じ話題を指す場合の統合方法。
- 重要度を `高 / 中 / 低` にするか、数値スコアも持つか。

この論点を先に決める理由:

- 一次情報優先を ranking の好みではなく architecture のルールにするため。

### 7. Translation の実装条件

決めること:

- 完全翻訳の単位。
- chunking の方針。
- 技術用語を保持する方法。
- 表とコードブロックを翻訳対象から外す処理。
- 速度目標を守るための本文長、並列数、timeout。

この論点を先に決める理由:

- 完全翻訳と 10 記事 3 分以内の性能目標が衝突しやすいため。

### 8. Markdown 出力仕様

決めること:

- MVP の Markdown テンプレート。
- 記事ごとの必須項目。
- 重要度、ソース、URL、日時、翻訳本文の表示順。
- 部分成功や取得失敗を出力に含めるか。

この論点を先に決める理由:

- 最終成果物の形が決まらないと、前段のデータ構造が確定しないため。

### 9. エラー時の扱い

決めること:

- source worker の一部失敗をどう扱うか。
- 翻訳失敗記事を除外するか、失敗として明記するか。
- Markdown 生成失敗を全体失敗にするか。
- ユーザーにどの粒度で失敗理由を返すか。

この論点を先に決める理由:

- マルチエージェント構成では部分失敗が通常ケースになり得るため。

### 10. 技術選定に進む条件

決めること:

- どの設計項目まで決まれば実装技術を選ぶか。
- CLI first で作るか、MCP server first で作るか。
- LangGraph.js などの orchestration framework を使うか、まず素の TypeScript で作るか。

この論点を最後に置く理由:

- framework から入ると責務設計がぶれやすいため。

## 議論の推奨順序

1. Manager の責務
2. Source Worker の最小構成
3. Shared Memory の最小 schema
4. Normalization / Content Extraction の境界
5. Manager の停止条件 / 成功条件
6. Judge / Dedupe の選別ルール
7. Translation の実装条件
8. Markdown 出力仕様
9. エラー時の扱い
10. 技術選定に進む条件

## 各論点で残すべき内容

各論点を議論したら、次を記録する。

- 決定事項
- 採らなかった選択肢
- 採用理由
- 未決事項
- 実装への影響

