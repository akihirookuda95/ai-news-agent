# ai-news-agent 開発全体の進め方

作成日: 2026-04-26

## 目的

`ai-news-agent` の開発再開後に、設計議論、ドキュメント更新、実装、検証をどの順番で進めるかを整理する。

この文書は、次の論点整理ファイルを使って議論を進める前提で作成する。

- `docs/design/current-discussion-points.md`

## 全体方針

まず設計論点を 1 つずつ確定し、その結果を docs に反映する。
その後、実装タスクへ分解し、最小構成で CLI として動く状態を作る。
性能目標を満たせることを確認してから、Codex CLI / MCP との接続方法を決める。

技術選定や framework 選定は、manager / worker / shared memory などの責務境界を決めた後に行う。

## 開発フェーズ

### 1. 論点整理フェーズ

目的:

- 既存 docs の内容を思い出し、今決めるべき論点を確認する。
- 実装に入る前に、責務境界と判断条件を再確認する。

見るファイル:

- `docs/design/current-discussion-points.md`
- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- `docs/specs/ai-news-agent-spec.md`

完了条件:

- 議論する論点の順番が決まっている。
- まず扱う論点が 1 つに絞られている。

### 2. 設計確定フェーズ

目的:

- manager 主導の最小マルチエージェント構成を、実装可能な粒度まで具体化する。

議論する順番:

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

完了条件:

- `manager`、`source worker`、`judge`、`translation`、`output` の責務が説明できる。
- `NewsRequest`、`CandidateItem`、`RankedItem`、`TranslatedItem`、`DigestResult` の役割が決まっている。
- 停止条件、部分成功、追加探索の上限が決まっている。
- Markdown 出力の最低限の形が決まっている。

### 3. Docs 更新フェーズ

目的:

- 議論で決まった内容を source of truth として docs に反映する。

主な更新対象:

- `docs/design/minimal-multi-agent-design-items.md`
- `docs/design/minimal-multi-agent-design-guidelines.md`
- `docs/specs/ai-news-agent-spec.md`

進め方:

- 1 つの論点を決める。
- 決定事項、採らなかった選択肢、採用理由、未決事項を記録する。
- docs 更新を 1 意図ごとにコミットする。

完了条件:

- 実装者が docs を見れば、最小構成の責務と流れを理解できる。
- 古い Issue 番号や古い Phase 1 MVP CLI 前提に依存していない。

### 4. 実装タスク分解フェーズ

目的:

- 設計を GitHub issue または実装タスクに分解する。

候補タスク:

- manager orchestrator の骨組み
- source adapter / source worker の実装
- shared state schema の定義
- normalization / content extraction
- judge / dedupe
- translation
- markdown output
- performance measurement

完了条件:

- 各タスクの入力、出力、完了条件が分かる。
- 1 issue / 1 task が大きすぎない粒度になっている。

### 5. 最小実装フェーズ

目的:

- 音声なし、MCP なしでもよいので、まず Markdown 生成まで通す。

最小フロー:

```text
query + limit
→ source fetch
→ normalize
→ judge / dedupe
→ translate
→ markdown output
```

優先する実装条件:

- source worker は並列実行する。
- 翻訳も記事単位で並列実行する。
- 追加探索は最大 1 回までにする。
- source worker の一部失敗は部分成功として扱う。

完了条件:

- CLI から 5 件または 10 件のニュース取得を実行できる。
- Markdown ファイルが生成される。
- 失敗した source がある場合も、理由を出力できる。

### 6. 性能検証フェーズ

目的:

- MVP の性能目標を満たせるか確認する。

測定条件:

- 5 記事を 2 分以内で処理する。
- 10 記事を 3 分以内で処理する。
- 測定範囲はコマンド開始から Markdown 生成完了まで。
- キャッシュなし。
- 音声なし。

確認すること:

- source fetch の所要時間。
- normalization / extraction の所要時間。
- judge / dedupe の所要時間。
- translation の所要時間。
- markdown output の所要時間。

完了条件:

- 5 記事と 10 記事の計測結果が残っている。
- ボトルネックが説明できる。
- 性能目標未達の場合、制約変更か実装改善の方針が決まっている。

### 7. Codex CLI / MCP 接続フェーズ

目的:

- 日常利用できる呼び出し口を整える。

決めること:

- CLI first で進めるか。
- MCP server first で進めるか。
- CLI 実装を MCP から呼ぶ形にするか。

完了条件:

- Codex CLI から自然に使える導線がある。
- `NewsRequest` を外側エージェントから渡せる。
- 生成された Markdown のパスをユーザーに返せる。

## 当面の進め方

当面は次の順番で進める。

1. `docs/design/current-discussion-points.md` の 1 番目から議論する。
2. 1 論点ごとに決定事項を docs に反映する。
3. 設計の主要論点が固まったら GitHub issue に分解する。
4. 最小実装に入る。
5. 性能検証後に Codex CLI / MCP 接続を判断する。

## 注意点

- 技術選定を先に進めない。
- manager に実処理を集めすぎない。
- shared memory を自由文ログにしない。
- 一次情報優先を judge と停止条件に組み込む。
- Reddit、X、dev.to、Zenn を MVP に戻さない。
- 音声生成は MVP の主軸にしない。

