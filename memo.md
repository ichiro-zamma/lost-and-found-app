# 卒業制作 実装・設計メモ

## 1. なぜ `enum` を使ったのか

### 本来やりたかったこと

`role` は「一般ユーザー（U）」か「施設管理者（A）」のどちらかしか入らないようにしたい。

`status` も「未マッチング（U）」「確認中（C）」「返却済み（R）」の3つしか入らないようにしたい。

つまり、**値の範囲を制限する制約**を設けたかった。

### 最初の設計（`CHAR(1)` + `CHECK` 制約）の課題

一般的なSQL設計では、例えば次のように書ける。

```sql
CHECK (role IN ('U', 'A'))
```

これによって、`role` に `U` または `A` 以外の値が入ることを防げる。

しかし、Prismaのスキーマ言語では、`CHECK` 制約を直接書く機能が正式にサポートされていなかった。

実験的な機能はあるものの、バージョンによって仕様が変わる可能性があり、安定して利用するには不向きだった。

そのため、生成されたマイグレーションSQLを手動で書き換える必要があった。

これは、今後スキーマを変更するたびに手動修正が必要になったり、マイグレーションによって修正内容が消えたり壊れたりするリスクがある。

### `enum` を選んだ理由

Prismaの標準機能である `enum` を使えば、`CHECK` 制約と同じように、

> 「決められた値しか入らない」

という制約を、手動でSQLを編集することなく実現できる。

さらに、TypeScript側でも `Role.U` のように型として扱えるため、誤った値を書いた場合にコンパイル時点で気づきやすいという安全性のメリットもある。

### トレードオフとして変わった点

DB上の実際の型は、当初想定していた `CHAR(1)`（固定長文字列）ではなく、PostgreSQLの `ENUM` 型に変わる。

ただし、これは**実装方法の違い**であり、

- `role` に決められた値だけを入れたい
- `status` に決められた値だけを入れたい

という、**値を制限したいという目的自体は変わっていない**。

### まとめ

**値の範囲チェックをPrismaの標準機能（`enum`）で型安全に実装するため、`enum` を採用した。**

---

# 2. なぜポート番号が変わって、データが見られるようになったのか

Prisma Studioを起動すると、次のようにポート番号が表示されることがある。

```text
Prisma Studio is running at: http://localhost:51212
```

また、別の起動では、

```text
Prisma Studio is running at: http://localhost:49152
```

のように、ポート番号が変わっている。

## 何が起きているのか

実行するたびに、

- `51212`
- `49152`

など、違うポート番号が使われている。

これは、今回使用しているPrismaのバージョンでは、Prisma Studioが起動時に空いているポートを選択する場合があるため。

## なぜポート番号が変わるのか

`.devcontainer/devcontainer.json` の `forwardPorts` に、Prisma Studio用として `5555` を追加していた。

しかし、今回使っているPrisma 7.10.0では、Studioが起動時にランダムな空きポートを選ぶ仕様になっていると考えられる。

これは、手順書作成時点で使用していたPrisma 7.8.0と、実際に使用しているPrisma 7.10.0の間にある細かな仕様変更が原因と考えられる。

## なぜ `51212` はつながらず、`49152` はつながったのか

コンテナの `devcontainer.json` では、明示的に転送設定しているポートが `5555` になっている。

VS CodeのDev Containerは、指定されたポートや実行中に自動検出したポートをホスト（Mac）側へ転送する。

そのため、

### `51212` のとき

たまたまVS Code側でポートの自動検出・転送がうまく行われなかった可能性がある。

### `49152` のとき

VS Codeが実行中のポートを自動検出して、ホスト側へ転送したため、アクセスできたと考えられる。

つまり、**Prisma Studio自体が起動していないのではなく、コンテナ側のポートとMac側のポート転送がうまく一致していなかった**ということ。

## 確実につながるようにする方法

毎回ランダムなポート番号を確認するのは不便なので、Prisma Studioを固定の `5555` ポートで起動する。

```bash
pnpm exec prisma studio --port 5555
```

これによって、`.devcontainer/devcontainer.json` ですでに転送設定している `5555` が使われる。

そのため、毎回、

```text
http://localhost:5555
```

でPrisma Studioにアクセスできるようになる。

---

# 3. `[id]` というフォルダ名の意味

Next.jsのApp Routerでは、フォルダ名を `[id]` のように角カッコで囲むことで、

> 「ここにはURLの一部として、動的な値が入ります」

という意味になる。

例えば、

```text
app/lost-items/[id]/page.tsx
```

という構成なら、

```text
/lost-items/1
/lost-items/2
/lost-items/3
```

のように、`id` の部分が変化するURLを扱える。

## `Props` の型定義

例えば次のコードがある。

```typescript
type Props = {
  params: Promise<{ id: string }>
}
```

これは、

> 「このページには `params` というデータが渡ってきて、その中には `id` があり、`id` は文字列である」

ということをTypeScriptに事前に説明している。

### `Props` とは

`Props` という名前の型を、自分で定義している。

中身は、

```text
params
  ↓
Promise<{ id: string }>
```

という形になっている。

つまり、

- `params` というプロパティがある
- `params` はPromise
- Promiseの中身には `id` がある
- `id` は `string` 型

という意味。

## なぜ `Promise` が付いているのか

以前のNext.jsでは、`params` は普通のオブジェクトとして、

```typescript
params.id
```

のようにすぐ利用できる場合があった。

しかし、新しいNext.jsのApp Routerでは、`params` が非同期的に扱われるようになり、`await params` として受け取る形になっている。

例えば、

```typescript
const { id } = await params
```

のようにする。

## なぜPromiseになっているのか

Next.jsのApp Routerでは、ストリーミング表示や並列レンダリングなど、ページを効率よく処理するための仕組みが使われている。

その中で、`params` のような値も他の非同期処理と同じ仕組みで扱えるように設計が変更された。

### `await params` と `await prisma...` の違い

```typescript
await params
```

→ **Next.jsの仕組み上、非同期で値を受け取るため**

```typescript
await prisma.lostItem.findUnique(...)
```

→ **実際にデータベースと通信して、データを取得するため**

どちらも `await` を使うが、理由は同じではない。

---

# 4. 判定：場所の詳細

落とし物と拾得物の場所が近いかを判定するとき、次のようなコードを使える。

```typescript
lostItem.locationDetail.includes(foundItem.locationDetail) ||
foundItem.locationDetail.includes(lostItem.locationDetail)
```

これは、

> **どちらかの文字列が、もう片方の文字列に含まれているか**

を判定している。

## `||` の意味

`||` は「または」という意味。

そのため、

```typescript
A || B
```

は、

> A または B のどちらかが `true` なら `true`

となる。

## なぜ `()` で囲むのか

例えば、

```typescript
(
  lostItem.locationDetail.includes(foundItem.locationDetail) ||
  foundItem.locationDetail.includes(lostItem.locationDetail)
)
```

のように書くと、「この2つの条件をひとまとまりとして判定する」ということが分かりやすくなる。

## `includes()` とは

`includes()` は、

> **ある文字列の中に、指定した文字列が含まれているか**

を調べるメソッド。

結果は `true` または `false` になる。

### 例

落とし物：

```text
渋谷駅の改札口
```

拾得物：

```text
改札口
```

この場合、

```typescript
"渋谷駅の改札口".includes("改札口")
```

は、

```text
true
```

になる。

そのため、この2つの場所は一致する可能性があると判断できる。

---

# 5. 日時の判定

今回は、落とした日時と拾った日時が**±3日以内**かどうかを判定する。

```typescript
const diffMs = Math.abs(
  lostItem.lostAt.getTime() - foundItem.foundAt.getTime()
)
```

## `getTime()` とは

`getTime()` は、日時を**ミリ秒単位の数値**に変換する。

基準となる日時は、

```text
1970年1月1日 0時0分0秒
```

。

つまり、

> 1970年1月1日から、その日時までに何ミリ秒経過したか

を数字として返す。

## `Math.abs()` とは

`Math.abs()` は、数値の**絶対値**を求める。

例えば、

```typescript
Math.abs(100)
```

は、

```text
100
```

で、

```typescript
Math.abs(-100)
```

は、

```text
100
```

になる。

今回使う理由は、日時の差がマイナスになっても、「どのくらい離れているか」という差の大きさだけを知りたいから。

---

# 6. なぜ1970年なのか？ なぜミリ秒なのか？

## コンピュータは日時をどうやって覚えているのか

私たちは、

```text
2026年9月5日 15時26分
```

のように日時を表現する。

これは人間にとって分かりやすい表現。

一方、コンピュータでは、日時を

> **ある基準となる時点から何ミリ秒経過したか**

という数字として扱う方法が広く使われている。

その基準となる時点が、

```text
1970年1月1日 0時0分0秒（UTC）
```

である。

これを**UNIX時間（UNIXエポック）**という。

1970年1月1日が基準になったのは、UNIXというOSが作られた頃の歴史的な経緯によるもの。

現在では、多くのプログラミング言語やシステムで使われる一般的な基準になっている。

---

# 7. `getTime()` の具体例

例えば、

```typescript
const date = new Date('2026-09-05T15:26:00')

console.log(date.getTime())
```

とすると、

```text
1788751560000
```

のような大きな数字が表示される。

この数字は、

> 1970年1月1日 0時0分0秒から、その日時までに経過したミリ秒

を表している。

つまり、`getTime()` を使うことで、

```text
2026年9月5日 15時26分
```

という日時を、

```text
1788751560000
```

という1つの数字に変換できる。

---

# 8. なぜ日時を数字に変換するのか

数字に変換することで、**普通の引き算ができるようになる**から。

例えば、

```typescript
const lostAt =
  new Date('2026-09-05T15:26:00').getTime()

const foundAt =
  new Date('2026-09-08T02:27:00').getTime()

const diff = foundAt - lostAt
```

とすると、2つの日時の時間差をミリ秒単位で計算できる。

つまり、

```text
日時
 ↓
getTime()
 ↓
ミリ秒の数字
 ↓
引き算
 ↓
2つの日時の時間差
```

という流れ。

日時をそのまま文字列として、

```text
「2026年9月5日 15時26分」
```

のように持っているだけでは、普通の数値計算のように引き算できない。

そのため、一度共通の「ミリ秒」というものさしに変換してから計算する。

---

# 9. `Math.abs()` が必要な理由

例えば、

```typescript
const diff = foundAt - lostAt
```

とする。

通常は、

```text
lostAt（落とした日時）
↓
foundAt（拾った日時）
```

の順になるので、結果はプラスになる。

しかし、入力ミスなどによって日時が逆になっていた場合、

```text
foundAt - lostAt
```

の結果がマイナスになることがある。

例えば、

```text
+270060000
```

または、

```text
-270060000
```

となる。

今回知りたいのは、

> **2つの日時がどのくらい離れているか**

という「差の大きさ」。

どちらが先かは重要ではない。

そのため、

```typescript
Math.abs(...)
```

を使って、マイナスをプラスに変換する。

---

# 10. 今回の日時判定のまとめ

この1行、

```typescript
const diffMs = Math.abs(
  lostItem.lostAt.getTime() - foundItem.foundAt.getTime()
)
```

がやっていることは3つ。

### ① 日時を数字に変換する

```typescript
lostItem.lostAt.getTime()
foundItem.foundAt.getTime()
```

それぞれを、

> 1970年1月1日からの経過ミリ秒

という数字に変換する。

### ② 引き算する

```typescript
lostItem.lostAt.getTime() - foundItem.foundAt.getTime()
```

2つの日時の時間差を求める。

### ③ 絶対値を取る

```typescript
Math.abs(...)
```

マイナスになってもプラスにして、純粋な「差の大きさ」を求める。

---

# 11. ここまでのまとめ
| 項目 | 実装・考え方 |
|---|---|
| `role` / `status` | `enum` を使って決められた値だけを許可 |
| `enum` を使った理由 | Prisma標準機能で型安全に値を制限するため |
| Prisma Studio | `--port 5555` で固定すると接続しやすい |
| `[id]` | URLの一部に動的な値を入れるNext.jsのルール |
| `params` | ページに渡されるURLパラメータ |
| `Promise<{ id: string }>` | 新しいNext.jsでは `params` を非同期的に扱うため |
| `includes()` | 文字列に別の文字列が含まれるか判定 |
|`getTime()` | 日時を1970年からの経過ミリ秒に変換 |
| `Math.abs()` | マイナスをプラスにして差の大きさを求める |
| 日時判定 | ミリ秒に変換して2つの日時の差を計算 |
