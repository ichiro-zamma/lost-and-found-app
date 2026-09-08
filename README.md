# 落とし物管理・マッチングアプリ

研修の卒業制作として開発している、落とし物と拾得物を自動マッチングするWebアプリケーションです。

## 概要

利用者はログインして「落とし物」または「拾得物」を登録します。システムは登録内容(種類・色・場所・日時)から自動で一致度スコアを計算し、条件が近い候補をマッチング候補として提示します。拾った人は実物を最寄りの施設(駅・学校など)に届け、施設の管理者が対面で秘密情報と実物を照合して本人確認を行い、返却済みへとステータスを更新します。

詳しいアプリの説明・機能要件は [要件定義書](./docs/要件定義書.md) を参照してください。

## 技術スタック

| 分類 | 技術 |
|---|---|
| フロントエンド | Next.js (App Router) / React / TypeScript / Tailwind CSS |
| ORM | Prisma |
| データベース | PostgreSQL |
| パッケージマネージャ | pnpm |
| 開発環境 | Docker / Dev Containers |

## セットアップ手順

### 前提条件

- Docker Desktop がインストール・起動済みであること
- VS Code + 拡張機能「Dev Containers」がインストール済みであること
- ホストマシンに Node.js のインストールは不要(すべてコンテナ内で完結)

### 手順

1. リポジトリをクローンする

\`\`\`bash
git clone git@github.com:ichiro-zamma/lost-and-found-app.git
cd lost-and-found-app
\`\`\`

2. `.env.example` をコピーして `.env` を作成する

\`\`\`bash
cp .env.example .env
\`\`\`

3. VS Code でフォルダを開き、コマンドパレット(`Cmd+Shift+P`)から「Dev Containers: Reopen in Container」を実行する
   - 初回はイメージのビルドと `pnpm install` が走るため数分かかる

4. コンテナ内のターミナルでマイグレーションを実行する

\`\`\`bash
pnpm exec prisma migrate dev
\`\`\`

5. 初期データ(マスタデータ・テストユーザー)を投入する

\`\`\`bash
pnpm exec prisma db seed
\`\`\`

6. 開発サーバーを起動する

\`\`\`bash
pnpm dev
\`\`\`

7. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### その他のコマンド

| コマンド | 用途 |
|---|---|
| `pnpm exec prisma studio --port 5555` | DBの中身をGUIで確認する(`http://localhost:5555`) |
| `pnpm exec tsc --noEmit` | 型チェック |
| `pnpm lint` | ESLintによるコードチェック |
| `pnpm exec prisma migrate reset` | DBを初期化してマイグレーション・シードをやり直す(開発環境専用) |

## ブランチ運用

- `main`: 動作確認済みの安定版
- `develop`: 開発用のメインブランチ。普段の開発作業はここで行う
- 区切りが良いところで `develop → main` のPull Requestを作成してマージする

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| [要件定義書](./docs/要件定義書.md) | アプリの概要、対象ユーザー、機能要件、非機能要件、画面一覧、業務フロー |
| [テーブル設計仕様書](./docs/テーブル設計仕様書.md) | テーブル定義、リレーション、マッチングスコアの判定方法 |
| [設計書](./docs/設計書.md) | 型定義・コンポーネント構成・state設計・バリデーション設計の方針 |
| [テスト項目書](./docs/テスト項目書.md) | 手動テストの確認項目・記録 |
