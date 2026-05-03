# rss-parser ライブラリ メモ

---

## rss-parser とは

RSSフィードのURLを渡すとXMLを取得・パースして、JavaScriptオブジェクトに変換してくれるライブラリ。

RSSはXML形式で配信されている。自前でXMLをパースするのは手間がかかるので、このライブラリに任せる。

---

## インストール

```bash
npm install rss-parser
npm install --save-dev @types/rss-parser
```

### コマンドの違い

| コマンド | 用途 | `package.json` での分類 |
|---|---|---|
| `npm install rss-parser` | 実際に動くライブラリ本体 | `dependencies` |
| `npm install --save-dev @types/rss-parser` | 型情報（開発時のみ） | `devDependencies` |

### `@types/rss-parser` が必要な理由

`rss-parser` 本体はJavaScriptで書かれているため、TypeScriptから使うと型情報がない。
`@types/rss-parser` を入れることで以下が有効になる：

- エディタの補完が効く
- コンパイル時に型チェックが通る

実行時には不要なので `--save-dev` でインストールする。

---

## `dependencies` vs `devDependencies`

`package.json` には2種類の依存がある。

| 分類 | 説明 | 例 |
|---|---|---|
| `dependencies` | 本番実行時にも必要なパッケージ | `rss-parser`, `dotenv` |
| `devDependencies` | 開発時だけ必要なパッケージ | `typescript`, `tsx`, `@types/*` |

`--save-dev` をつけると `devDependencies` に記録される。
