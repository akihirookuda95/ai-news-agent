# 学習記録ノート

---

## 2026-03-11 — Day 1: 環境構築

### やったこと
- `npm init -y` でプロジェクト初期化
- TypeScript環境を構築（`typescript`, `tsx`, `@types/node`）
- `dotenv` を導入（APIキー管理の準備）
- `tsconfig.json` を設定
- `src/index.ts` を作成し、`npx tsx` で実行確認

---

### 各ステップの理解

#### `npm init -y`
`package.json` を生成する。Node.jsプロジェクトの設定ファイルで、パッケージ名・バージョン・依存関係などを管理する。`-y` は全項目をデフォルト値で即答するオプション。

#### パッケージの役割

| パッケージ | 役割 |
|---|---|
| `typescript` | TypeScriptのコンパイラ本体 |
| `tsx` | TSファイルをビルドなしで直接実行するランナー（`ts-node` の高速版） |
| `@types/node` | Node.jsの型定義（`process`, `fs` 等が使えるようになる） |
| `dotenv` | `.env` ファイルを読み込んで環境変数に展開するライブラリ |

`--save-dev` は「開発時だけ使う」依存として記録するオプション。本番実行には不要なツール類はここに入れる。

#### `tsconfig.json` の主な設定

| 設定 | 内容 |
|---|---|
| `target: ES2022` | コンパイル後のJSのバージョン。async/awaitなどをそのまま使える |
| `module: NodeNext` | Node.jsのESM形式に合わせたモジュール解決 |
| `outDir: ./dist` | コンパイル後のJSファイルの出力先 |
| `rootDir: ./src` | TSソースファイルのルートディレクトリ |
| `strict: true` | 型チェックを厳しくする（バグを早期に検出） |

#### `.env` ファイル
APIキーなど秘密情報を置くファイル。`.gitignore` に記載済みなのでgitに含まれない。Day 3でClaude APIキーを追加予定。

#### `tsx` vs `tsc`
- `tsc src/index.ts` → TypeScriptをJSにコンパイルしてファイルを生成する
- `npx tsx src/index.ts` → コンパイルせず直接実行する（開発時に使う）

#### `package.json` vs `package-lock.json`

**`package.json`** — 人間が書く設定ファイル
- プロジェクトの依存パッケージとバージョン範囲を記述する
- `"typescript": "^5.0.0"` のように `^` や `~` で「範囲」を指定できる
- `npm install` 時に何をインストールするかの「指示書」

**`package-lock.json`** — npm が自動生成するロックファイル
- 実際にインストールされたパッケージの正確なバージョンを記録する
- `"version": "5.7.3"` のように完全に固定される
- 依存の依存（間接依存）まですべて記録される

`package.json` だけだと別環境で `npm install` したとき、マイナーバージョンの違いで動作が変わるリスクがある。`package-lock.json` があれば `npm ci` で全員が同じバージョンを使える。

| ファイル | git管理 |
|---|---|
| `package.json` | ✅ 必ずコミットする |
| `package-lock.json` | ✅ コミットする（再現性のため） |
| `node_modules/` | ❌ `.gitignore` に入れる（`npm install` で復元できるから） |

---

### 確認ポイント
- `npx tsx src/index.ts` → `ai-news-agent started` と表示 ✅
