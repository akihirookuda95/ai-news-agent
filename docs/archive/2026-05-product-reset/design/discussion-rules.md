# ai-news-agent 設計議論の進め方

作成日: 2026-04-26

## 目的

`ai-news-agent` の設計論点を 1 つずつ議論し、決定事項を実装可能な形で docs に残すための進め方を固定する。

このルールは、主に次のファイルを使った議論に適用する。

- `docs/design/current-discussion-points.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- `docs/specs/ai-news-agent-spec.md`

## 基本方針

- 1 回の議論では 1 つの論点だけを扱う。
- 役割名ではなく、責務、入力、出力、判断権限で決める。
- 最低 2 つの選択肢を比較してから決める。
- 決定事項、採らなかった選択肢、採用理由、未決事項を残す。
- 決まった内容は docs に反映し、1 意図ごとにコミットする。

## 議論フォーマット

各論点は、次の型で議論する。

### 1. 今回の論点

何を決めるかを 1 文で固定する。

例:

```text
今回は manager が持つ責務と、worker / judge / output に渡す責務の境界を決める。
```

### 2. 前提

既存仕様、制約、維持する方針を確認する。

確認する観点:

- 読む用途を主軸にするか。
- MVP の対象ソースに含めるか。
- 一次情報優先を崩していないか。
- 5 記事 2 分以内、10 記事 3 分以内の性能目標に影響するか。
- manager 主導の最小マルチエージェント構成に整合するか。

### 3. 選択肢

最低 2 案を出す。

例:

```text
案 A: manager を薄い orchestrator にする。
案 B: manager に ranking / dedupe の最終判断も持たせる。
```

### 4. 比較軸

次の観点で比較する。

- 責務: どの module / agent が何を持つか。
- 契約: 入力、出力、不変条件が明確か。
- 性能: 並列化や LLM 呼び出し回数に悪影響がないか。
- 失敗時: 部分失敗を説明しやすいか。
- 将来変更コスト: source や translation QA を追加しやすいか。

### 5. 推奨案

採るべき案と理由を明確にする。

推奨案には、次を含める。

- 採用する案。
- 採用理由。
- 主なリスク。
- リスクを抑える条件。

### 6. 決定事項

実装や docs に反映できる形で書く。

例:

```text
manager は計画、ラウンド制御、停止判定、翻訳対象確定を持つ。
manager は個別 source fetch、本文抽出、翻訳、Markdown 書き出しを持たない。
```

### 7. 未決事項

今は決めないことを明示する。

例:

```text
LangGraph.js を使うかどうかは、責務境界が固まった後の技術選定フェーズで決める。
```

### 8. docs 反映

決まった内容を該当 docs に反映する。

主な反映先:

- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- `docs/specs/ai-news-agent-spec.md`

## 1 論点ごとの進め方

```text
議論する
→ 決定事項を短くまとめる
→ docs に反映する
→ commit する
→ 次の論点へ進む
```

## 記録する内容

各論点を決めたら、次を残す。

- 決定事項
- 採らなかった選択肢
- 採用理由
- 未決事項
- 実装への影響

## 注意点

- 複数論点を同時に決めない。
- framework やライブラリ選定から議論を始めない。
- manager に実処理を集めすぎない。
- shared memory を自由文ログにしない。
- 一次情報優先を後工程だけに押し込まない。
- 性能目標に影響する判断は、必ず影響範囲を明記する。

