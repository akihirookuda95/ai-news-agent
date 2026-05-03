# 2026-05-03 product vision 確定と MVP 要件議論への移行コンテキスト

## 1. 目的（Goal）

- `ai-news-agent` の最終プロダクト像を暫定確定し、今後の source of truth を整理する。
- 旧 docs を archive に退避し、現行方針を `product-vision-and-mvp-direction.md` に集約する。
- 次回以降、MVP の目的・機能要件・非機能要件を、認知負荷を抑えながら Q1〜Q5 の回答ベースで決める。

## 2. 現在地（Current status）

- 最終プロダクト像は `docs/design/product-vision-and-mvp-direction.md` を暫定確定版として扱うことで合意した。
- `docs/README.md` を追加し、現役 source of truth を明示した。
- `AGENTS.md` を新しい product vision / MVP-0 / controlled multi-agent 方針に更新した。
- 旧 docs は `docs/archive/2026-05-product-reset/` に退避済み。
- `fb33d78` を GitHub `origin/main` に push 済み。
- 次回は MVP 要件に関する Q1〜Q5 を順にユーザーへ質問し、ユーザーが Q5 まで回答したら、入れるべき要件を分析して新規 Markdown に書き出す。

## 3. 重要な決定（Key decisions）

- 結論: 最終プロダクト像は `product-vision-and-mvp-direction.md` を暫定確定版とする。
  - 理由: Q1〜Q7 の回答から、価値・利用体験・source・出力・agent 自律性・品質軸・長期位置づけが整理できたため。
  - 記録先: `docs/design/product-vision-and-mvp-direction.md`

- 結論: 現行 source of truth は `docs/README.md` と `docs/design/product-vision-and-mvp-direction.md` とする。
  - 理由: 旧仕様・旧設計メモが現行のプロダクト像と混在し、認知負荷を上げていたため。
  - 記録先: `docs/README.md`、`AGENTS.md`

- 結論: 旧 docs は削除ではなく archive 化する。
  - 理由: 過去の判断背景は参照価値があるが、現行方針の判断基準にするとノイズになるため。
  - 記録先: `docs/archive/2026-05-product-reset/`

- 結論: 次回以降は MVP 要件を Q1〜Q5 の回答ベースで決める。
  - 理由: 要件を一括で洗い出すと認知負荷が高いため、論点を小さく分ける。
  - 記録先: この context の `次回やること`

## 4. 未決事項・不明点（Open questions / Unknowns）

- MVP の目的
  - なぜ重要か: MVP で何を検証すれば成功かが決まらないと、機能要件を削れないため。
  - 何が分かれば決められるか: ユーザーが Q1 で最優先の検証価値を選ぶこと。

- MVP の対象 source
  - なぜ重要か: source の数が増えると worker / adapter / dedupe / failure handling の認知負荷が上がるため。
  - 何が分かれば決められるか: 公式ブログ 1 系統か、少数の公式 source 横断かの判断。

- MVP の出力形式
  - なぜ重要か: research brief の最低限の読みやすさと実装量を決めるため。
  - 何が分かれば決められるか: テーマ別整理、重要リンク、翻訳、自分への影響のうち何を MVP に含めるか。

- MVP の機能要件
  - なぜ重要か: manager / worker / judge / translation / output の責務境界を MVP サイズに縮めるため。
  - 何が分かれば決められるか: Q1〜Q5 の回答を横断した優先順位。

- MVP の非機能要件
  - なぜ重要か: ノイズ低減、速度、翻訳品質、失敗時の扱いの優先順位を固定するため。
  - 何が分かれば決められるか: MVP で壊してはいけない品質と、後回しにできる品質。

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

- 最終像は AI intelligence backend。
- MVP / MVP-0 では source を絞り、過剰な自律性・通知・音声・hosted DB は後回しにする。
- manager 主導の controlled multi-agent を維持する。
- agent 間の受け渡しは structured shared state を優先する。
- manager を太らせず、source adapter / normalization / ranking or judging / translation / output の責務を分ける。
- 全記事全文翻訳は MVP 初期の必須条件ではない。
- 最上位価値は、完全翻訳ではなく情報発見・ノイズ低減・自分向け relevance 判断。

## 6. 関連ファイル（Files touched / relevant files）

- `docs/design/product-vision-and-mvp-direction.md`
  - なぜ重要か: 最終プロダクト像と MVP の絞り込み方針の現行 source of truth。
  - 何が変わったか: Q1〜Q7 の回答をもとに新規作成。
  - 関連コミットID: `fb33d78`

- `docs/README.md`
  - なぜ重要か: docs 内の現役文書と archive 文書の扱いを定義する入口。
  - 何が変わったか: 現役 source of truth を明記。
  - 関連コミットID: `fb33d78`

- `AGENTS.md`
  - なぜ重要か: Codex がこの repo で守る作業前提。
  - 何が変わったか: 旧 source of truth 指定を削除し、新しい product vision / MVP-0 方針に更新。
  - 関連コミットID: `fb33d78`

- `docs/archive/2026-05-product-reset/`
  - なぜ重要か: 旧 specs / design / dev-notes を現行方針から分離しつつ保存する場所。
  - 何が変わったか: 旧 docs を archive 配下へ移動。
  - 関連コミットID: `fb33d78`

## 7. 評価文脈（Evaluation context）

- まだ実装・評価データセットはない。
- 旧性能目標の 5記事2分 / 10記事3分は archive 側の前提であり、現行 MVP 要件としては再確認が必要。
- 現行の重要指標候補:
  - ノイズが少ないこと。
  - 自分の関心技術・関心目的に合うこと。
  - 今読むべき / 試すべき判断がしやすいこと。
  - 重要情報を大きく見落とさないこと。
  - 必要な記事を日本語で理解しやすいこと。

## 8. 次回やること（Next steps）

1. MVP 要件 Q1: MVP で一番検証したい価値をユーザーに選んでもらう。
   - Exit criteria: MVP の主目的が 1 つ決まる。
2. MVP 要件 Q2: MVP の対象 source を決める。
   - Exit criteria: 公式ブログ 1 系統か、少数公式 source 横断かが決まる。
3. MVP 要件 Q3: MVP の出力形式を決める。
   - Exit criteria: research brief に最低限含める項目が決まる。
4. MVP 要件 Q4: MVP の機能要件を絞る。
   - Exit criteria: manager / worker / judge / translation / output の最低責務が決まる。
5. MVP 要件 Q5: MVP の非機能要件を絞る。
   - Exit criteria: 品質、速度、ノイズ、失敗時、拡張性の優先順位が決まる。
6. ユーザーが Q1〜Q5 すべてに回答したら、回答を分析して入れるべき要件を整理する。
7. 分析結果を新規 Markdown に書き出す。
   - 候補パス: `docs/design/mvp-requirements.md`

## 9. リスク（Risks / gotchas）

- 旧 docs の前提が IDE の open tabs や記憶から復活するリスク。
  - 回避策: 現行判断は必ず `docs/README.md` と `product-vision-and-mvp-direction.md` を参照する。

- MVP に最終像の要素を入れすぎるリスク。
  - 回避策: Q1〜Q5 で MVP の検証目的を先に固定する。

- 完全翻訳を再び最上位価値として扱うリスク。
  - 回避策: 現行の最上位価値は情報発見・ノイズ低減・relevance 判断と明記する。

- controlled multi-agent が過剰設計になるリスク。
  - 回避策: MVP-0 では source と自律性を絞り、責務境界だけを検証する。

- context / daily-log が source of truth と混同されるリスク。
  - 回避策: これらは復帰用・作業記録であり、現行 source of truth は docs 側と明記する。

## 10. 参考（References, optional）

- Anthropic: Building effective agents
  - https://www.anthropic.com/engineering/building-effective-agents
  - 単純な構成から始め、必要な場合だけ agentic system の複雑性を増やすべきという方針を参考にした。
- OpenAI Cookbook: Structured Outputs for Multi-Agent Systems
  - https://developers.openai.com/cookbook/examples/structured_outputs_multi_agent
  - multi-agent の受け渡しで structured output を重視する考え方を参考にした。
- LangChain multi-agent docs
  - https://docs.langchain.com/oss/python/langchain/multi-agent
  - supervisor / handoff / routing などの pattern 比較の参考。

## 関連コミットID

- `fb33d78` docs: プロダクト方針のsource of truthを再整理
