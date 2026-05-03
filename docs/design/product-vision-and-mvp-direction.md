# Product Vision and MVP Direction

作成日: 2026-05-03

## 目的

`ai-news-agent` の最終的なプロダクト像と、そこから逆算した MVP の絞り込み方針を整理する。

この文書は、最小マルチエージェント設計の認知負荷を下げるために、先に次を明確化する。

- 最終的にどのようなプロダクトを目指すか
- ユーザーにとっての一番大きな価値は何か
- MVP では何を検証すべきか
- MVP では何を削るべきか

## 背景

従来の設計文書では、MVP の中心価値が「英語圏 AI 一次情報を完全翻訳 Markdown として短時間で読むこと」に寄っていた。

しかし、今回の議論では、ユーザーにとっての上位価値は完全翻訳そのものではなく、次にあることが分かった。

- 重要な AI 一次情報を見落としにくくすること
- ノイズを抑え、自分に関係ある情報を拾うこと
- 今読むべきもの、試すべきものを判断できること
- 必要に応じて英語記事を日本語で理解しやすくすること

そのため、今後の MVP 要件整理では、完全翻訳を最上位価値として固定しすぎず、情報発見・ノイズ低減・自分向け整理を中核に置く。

## 最終プロダクト像

`ai-news-agent` は、ユーザーの関心技術・関心目的に沿って、公式情報とコミュニティ反応を継続収集し、ノイズを抑えたテーマ別 research brief を生成・蓄積する AI intelligence backend である。

manager 主導の controlled multi-agent が source 選択、検索、評価、必要に応じた追加調査を行い、ユーザーが「今読むべきもの」「試すべきもの」を判断できる形に整理する。

重要記事は必要に応じて全文翻訳し、Markdown、通知、検索可能な蓄積データとして提供する。将来的には hosted DB、外部通知、Codex / Claude Code / 他アプリ連携、音声 digest に拡張できる。

## 最終的な価値定義

最終的な主価値は、次の一文で表す。

> 自分の関心領域に合う AI 一次情報と関連反応を継続的に収集し、ノイズを抑えながら、今読むべきもの・試すべきものを判断しやすくするパーソナル AI リサーチアシスタント。

優先順位は次の通り。

1. ノイズが少なく、読む価値が高いこと
2. 重要情報を大きく見落とさないこと
3. 自分にとって今読むべき / 試すべきか判断できること
4. 必要な情報を広く拾えること
5. 重要記事を必要に応じて日本語で理解できること
6. 速度は重要だが、最上位ではないこと

## 利用体験の最終像

最終的な利用体験は、手動 CLI digest ではなく、定期収集と必要時の深掘りを組み合わせたものにする。

- 普段は定期収集される
- ユーザーの関心技術・関心目的に沿って source と検索対象が選ばれる
- テーマ別 research brief が Markdown として蓄積される
- digest 生成は Slack / Discord / Email など外部通知で知らせる
- 必要なときだけ Codex / Claude Code から対話的に深掘りする
- 将来的には検索可能な蓄積データとして扱う
- 将来的には歩きながら聞ける音声 digest も提供する

## 情報源の最終スコープ

最終的には、公式情報とコミュニティ情報を横断する。

対象候補:

- 公式ブログ
- GitHub Releases / changelog
- 公式ドキュメント更新
- Hacker News
- Reddit
- X
- Zenn / Qiita
- dev.to

扱い方:

- 公式情報は、事実・発表・仕様変更の把握に使う
- コミュニティ情報は、反応・温度感・実務上の困りごと・見落とし発見に使う
- 日本語ソースは補助として扱う
- 固定対象に加えて、関心テーマに応じた周辺技術も拾う

ただし MVP では、すべてを同時に扱わない。

## 出力の最終像

最終的な主出力は、Markdown、通知、検索可能な蓄積データである。

research brief は記事単位ではなく、テーマ単位で整理する。

含める情報:

- テーマ概要
- 公式情報
- コミュニティ反応
- 自分への影響
- 今読むべきか
- 試すべきか
- 重要リンク
- 必要な本文翻訳

翻訳は、全記事に対して常に全文翻訳するのではなく、重要記事を対象にする。

## Agent 設計の最終像

最終的な agent 設計は、完全自律型ではなく controlled multi-agent を基本にする。

manager は最終的に次を判断する。

- 関心設定に応じた source 選択
- 検索クエリ生成
- 追加調査の要否
- 深掘りの要否
- 別 source 探索の要否
- 翻訳対象
- 出力対象

通常 digest では制御された範囲で動かす。

深掘り時だけ、複数ラウンドの追加調査や別 source 探索を許す。

agent が迷った場合の方針:

- 低コストな判断は agent が進める
- コスト、時間、スコープが大きい判断はユーザーに確認する
- 判断理由は brief または実行ログに残す

## 長期的な位置づけ

長期的には、個人用 CLI に閉じない AI 情報収集 backend を目指す。

- 最終的には hosted DB / hosted service も視野に入れる
- Slack / Discord / Email など外部通知と接続する
- Codex / Claude Code / 他アプリから呼べる形にする
- 近い関係者やチームでも使える余地を残す
- ただし一般公開 SaaS を最初から前提にはしない

最も避けたい状態は、個人用途には十分な価値が出る前に、過剰設計で開発が進まなくなることである。

## MVP の絞り込み方針

最終像は広いが、MVP は大きく削る。

MVP で検証すべき中心価値は次。

> 限られた公式情報 source から、ユーザーの関心技術・関心目的に合う重要更新を拾い、ノイズを抑えたテーマ別 research brief として出力できるか。

MVP の方向性:

- 最初は公式情報中心にする
- source は少数に絞る
- 追加探索は入れない、または最大 1 回に制限する
- 全記事全文翻訳ではなく、重要記事または必要箇所の翻訳に寄せる
- 通知、音声、hosted DB、広いコミュニティ source は後続に回す
- manager / worker / judge / translation / output の責務境界は残す

## MVP 候補

### MVP-0

最初に実装・検証する最小単位。

- 対象 source は公式ブログ 1 系統に絞る
- `manager`
- `official_blog_worker`
- simple judge
- translation
- markdown output
- shared memory は最小 schema のみ
- 追加探索なし
- 通知なし
- 音声なし
- hosted DB なし

検証すること:

- manager 主導の構成が過剰ではないか
- source worker の出力を共通 schema にできるか
- 公式情報から関心テーマに合う候補を拾えるか
- テーマ別 research brief として読めるか

### MVP

MVP-0 の次に目指す構成。

- 公式ブログ
- GitHub Releases / changelog
- 公式ドキュメント更新の一部
- simple judge / dedupe
- テーマ別 research brief
- 重要記事の翻訳
- Markdown 蓄積
- 実行ログと失敗理由

Hacker News、Reddit、X、Zenn、Qiita、dev.to、通知、音声、hosted DB は MVP 以降に回す。

## MVP でやらないこと

- Reddit
- X
- Zenn / Qiita
- dev.to
- 広範囲な Hacker News 収集
- 定期実行
- 外部通知
- 音声 digest
- hosted DB
- Web UI
- 深い自律探索
- 複数ラウンドの深掘り調査
- 一般公開 SaaS 前提の設計

## 現行 docs への影響

現行 docs では、完全翻訳と 2〜3 分以内の Markdown 出力が強く前面に出ている。

今回の議論を反映する場合、今後は次の観点で見直す必要がある。

- 完全翻訳は重要だが、最上位価値ではない
- 最上位価値は情報発見、ノイズ低減、自分向け relevance 判断である
- 速度は重要だが、品質より常に優先するわけではない
- 最終像には定期収集、通知、蓄積、検索、深掘りが含まれる
- MVP ではそれらを実装せず、将来拡張の方向として残す

## 参考にした agent 設計の考え方

- Anthropic: Building effective agents
  - https://www.anthropic.com/engineering/building-effective-agents
  - 単純な構成から始め、必要な場合だけ agentic system の複雑性を増やすべきという方針を参考にした。
- OpenAI Cookbook: Structured Outputs for Multi-Agent Systems
  - https://developers.openai.com/cookbook/examples/structured_outputs_multi_agent
  - multi-agent の受け渡しで structured output を重視する考え方を参考にした。
- LangChain multi-agent docs
  - https://docs.langchain.com/oss/python/langchain/multi-agent
  - supervisor / handoff / routing などの pattern を比較するときの参考にする。

## 次に決めること

次は、この最終像を前提に MVP の目的を確定する。

候補:

1. 公式一次情報を対象に、関心技術に合う重要更新を拾えるか検証する
2. 公式ブログ 1 系統だけで、テーマ別 research brief を生成できるか検証する
3. 少数 source を横断して、ノイズを抑えた「今読むべき情報」を選べるか検証する

推奨:

- `MVP-0`: 公式ブログ 1 系統だけで、テーマ別 research brief を生成できるか検証する
- `MVP`: 少数の公式 source を横断して、関心技術に合う重要更新を拾えるか検証する
