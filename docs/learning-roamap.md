# ai-news-agentプロジェクト開始前 直近学習ロードマップ (2026年3月版)

**作成日**: 2026-03-22
**更新日**: 必要に応じて
**目標**: Phase 1（MVP CLI）開始前に、LangGraph.jsとMCPの「できること」と「設計パターン」を完全に理解し、自分で手書き設計ができる状態にする
**総学習時間**: 週末8時間 × 2週間 = 最大16時間（平日は0時間）

## 全体スケジュール

### Week 1（2026/3/22(土)〜3/23(日)）：LangGraph.js徹底理解（8時間）
**目的**: Graph思考を体に染み込ませ、二重エージェント構造を自分で設計できるようになる

- **3/22(土) 4時間**
  - LangGraph.js公式リポジトリをClone
    `git clone https://github.com/langchain-ai/langgraphjs.git`
  - `examples/intro/`フォルダを全部動かす（StateGraph + node + edgeの基本）
  - `examples/multi_agent/`フォルダを動かし、「multi-agent collaboration」のState設計をメモ
  - 手書き（またはDraw.io）で**あなたの仕様書の内側エージェント処理フロー**をState + Nodes + Edgesで描く

- **3/23(日) 4時間**
  - `examples/human-in-the-loop/` と `examples/persistence/` を動かす
  - 各exampleのコードを写経しながら「なぜこのState定義か？」「フォールバックはどのedgeで分岐するか？」をNotionにメモ
  - 仕様書の「フォールバック付き多段フェッチ戦略」をLangGraphのグラフで再設計してみる（練習）

**Week 1完了定義**: 手書きグラフが描けて「このStateにしたら耐障害性が上がる」と自分の中で説明できる

### Week 2（2026/3/29(土)〜3/30(日)）：MCP仕様＋サーバー実装理解（8時間）
**目的**: MCPサーバーを自分で作れるようになり、Phase 3の設計判断ができる

- **3/29(土) 4時間**
  - MCP TypeScript SDKをClone
    `git clone https://github.com/modelcontextprotocol/typescript-sdk.git`
  - `/examples/`フォルダを全部動かす（特にシンプルなtool定義のもの）
  - 公式ドキュメント（https://modelcontextprotocol.io/docs/sdk）を読み、`server.tool()`のschema定義を写経

- **3/30(日) 4時間**
  - あなたの仕様書の`NewsRequest`インターフェースをMCP準拠のzod schemaに変換して書いてみる
  - 「fetch_ai_news」ツールの骨組みだけMCPで実装（仮のreturnでOK）
  - Claude Code / Codex CLIでMCPサーバーを実際に呼び出してみる（疎通確認）

**Week 2完了定義**: `server.tool("fetch_ai_news", { ... })`を自分で書ける

## 学習リソース（優先順）
1. LangGraph.js公式examples（最重要）
2. 『LangChainとLangGraphによるRAG・AIエージェント［実践］入門』（技術評論社）
3. MCP公式TypeScriptドキュメント
4. YouTube「Build MCP Server with LangGraph.js 2026」（検索推奨）

## 次のアクション
- Week 2完了後 → すぐに`feature/phase1-setup`ブランチを作成してPhase 1開始
- 学習中に詰まったらIssueに記録（後でポートフォリオに使える）

このロードマップを完了すれば、**Phase 1の設計を自分で判断できる**状態になっています！
