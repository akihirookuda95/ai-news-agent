# Context: Issue #2 LangGraph.js 写経環境構築・写経途中

**日付**: 2026-03-26
**ブランチ**: `feature/issue-2-langgraphjs-basics`

---

## 1. 目的（Goal）

- Issue #2「LangGraph.js 基本動作確認」を完了させる
- `StateGraph` / `node` / `edge` を写経して動かし、Graph思考を体に染み込ませる
- 最終的に内側エージェント処理フローを State + Nodes + Edges で描けるようになる

---

## 2. 現在地（Current status）

**完了**:
- `langgraphjs/` を `ai-news-agent/` 内に clone し `.git` を削除（nested repo 問題を回避）
- `.gitignore` に `langgraphjs/` を追加しコミット済み（`618b849`）
- `langgraphjs/examples/practice/` に写経環境を構築
  - `package.json` / `tsconfig.json` 作成・`npm install` 完了
- `agent.ts` Block 1（import + ツール定義）写経完了
- `agent.ts` Block 2 途中まで写経済み（`shouldContinue` の中身が未完、`callModel` 未着手）

**進行中**:
- `agent.ts` Block 2 の残り（`shouldContinue` の中身 + `callModel`）
- `agent.ts` Block 3（StateGraph 定義 + 実行）が未着手

---

## 3. 重要な決定（Key decisions）

- **写経アプローチを採用**
  - 結論: Jupyter Notebook（`.ipynb`）をそのまま動かさず、`.ts` ファイルに書き起こして `tsx` で実行
  - 理由: `jupyter` 未インストール・写経の方が学習効果が高い
  - 記録先: このコンテキスト

- **OpenAI → Anthropic に変更**
  - 結論: `@langchain/anthropic` + `claude-haiku-4-5-20251001` を使用
  - 理由: プロジェクトは Claude API 前提、OpenAI キー不要にするため
  - 記録先: このコンテキスト

- **Tavily → ダミーツールに変更**
  - 結論: `tool()` 関数で `getWeather` ダミーツールを自作
  - 理由: Tavily API キー不要でツール呼び出しの動作を確認するため
  - 記録先: このコンテキスト

- **`langgraphjs/` の配置方法**
  - 結論: `ai-news-agent/` 内に clone → `.git` 削除 → `.gitignore` で除外
  - 理由: Claude Code CLI を `ai-news-agent/` で起動したまま参照できる。`.git` 削除で nested repo 問題を回避
  - 記録先: `.gitignore`

---

## 4. 未決事項・不明点（Open questions / Unknowns）

- **`agent.ts` の実行確認**
  - なぜ重要: 写経が正しくできているか動作で検証する必要がある
  - 何が分かれば決められるか: Block 3 まで写経完了後に `npx tsx agent.ts` で実行して確認

- **`examples/multi_agent/` の写経**
  - なぜ重要: Issue #2 のタスクに含まれている（State 設計をメモする）
  - 何が分かれば決められるか: `quickstart` の写経・実行完了後に着手

---

## 5. 実装・アーキテクチャの要点（Architecture / Implementation notes）

### agent.ts の構成（写経中）

```
[__start__]
    ↓
[agent ノード] ← callModel（LLM 呼び出し）
    ↓ shouldContinue で分岐
    ├─ tool_calls あり → [tools ノード] → [agent ノード]（ループ）
    └─ tool_calls なし → [__end__]
```

### 写経環境
- 場所: `langgraphjs/examples/practice/agent.ts`
- 実行: `npx tsx agent.ts`（`practice/` ディレクトリ内で実行）
- API キー: `agent.ts` の先頭に `process.env.ANTHROPIC_API_KEY` を直書き（`langgraphjs/` は gitignore 済みで安全）

### package.json の依存関係
```json
{
  "@langchain/anthropic": "^0.3.0",
  "@langchain/core": "^0.3.0",
  "@langchain/langgraph": "^0.2.0",
  "zod": "^3.22.0"
}
```

---

## 6. 関連ファイル（Files touched / relevant files）

- `langgraphjs/examples/practice/agent.ts` — 写経中のメインファイル（Block 2 途中まで）
- `langgraphjs/examples/practice/package.json` — 依存関係定義
- `langgraphjs/examples/practice/tsconfig.json` — VS Code 補完用（tsx は参照しない）
- `.gitignore` — `langgraphjs/` を除外追加（`618b849`）
- `langgraphjs/examples/quickstart/quickstart.ipynb` — 写経元の Notebook

**関連コミット**:
- `618b849` — chore: langgraphjs/ を .gitignore に追加

---

## 7. 評価文脈（Evaluation context）

N/A（学習・写経フェーズ）

---

## 8. 次回やること（Next steps）

1. `agent.ts` Block 2 の残りを写経する
   - `shouldContinue` の中身（`tool_calls` 判定 + `return "tools"` / `return "__end__"`）
   - `callModel` 関数
2. `agent.ts` Block 3 を写経する
   - `StateGraph` 定義（`addNode` / `addEdge` / `addConditionalEdges`）
   - `workflow.compile()` + `app.invoke()` で実行
3. `npx tsx agent.ts` で動作確認（天気を聞くと `getWeather` ツールが呼ばれることを確認）
4. `examples/multi_agent/multi_agent_collaboration.ipynb` を読んで State 設計をメモ
5. 内側エージェント処理フローを Graph として描く（Draw.io or 手書き）
6. Issue #2 完了 → docs にメモをコミット → `/gh-pr` で PR 作成（`Closes #2`）

---

## 9. リスク（Risks / gotchas）

- **`import { get } from "node:http"` が混入している**
  - `agent.ts` 7行目に不要な import が入っている。次回写経再開時に削除すること
- **`shouldContinue` の中身が空**
  - 現在 `shouldContinue` は `lastMessage` を取得しているだけで `return` 文がない。写経再開時に続きを追記する
- **API キーの直書き**
  - `langgraphjs/` は `.gitignore` で除外済みだが、`git add -f` などで誤ってコミットしないよう注意
- **`tsconfig.json` の `module` が小文字**
  - `"nodenext"` と書いたが動作上は問題なし（TypeScript のパーサーは大文字小文字を区別しない）

---

## 10. 参考（References）

- `langgraphjs/examples/quickstart/quickstart.ipynb` — 写経元（StateGraph 手動構築版が Block 2 以降）
- `langgraphjs/examples/multi_agent/multi_agent_collaboration.ipynb` — 次に読む Notebook
