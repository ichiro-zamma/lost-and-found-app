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

## 2-1.`"use server"` の位置

上に書く場合と中に書く場合を比較すると、次のようになる。

| 書く場所 | 意味 |
|---|---|
| ファイルの上 | このファイル全体でServer Actionを使う |
| 関数の中 | この関数だけServer Actionにする |

---

## 2-2. `prisma.$transaction`

`prisma.$transaction` は、

> **複数のデータベース処理を1つのまとまりとして実行し、途中で失敗した場合にデータが中途半端な状態になるのを防ぐために使用している。**

例えば、次のように複数のDB処理をまとめて実行できる。

```typescript
await prisma.$transaction([
  prisma.match.create(...),
  prisma.lostItem.update(...),
  prisma.foundItem.update(...),
])
```

今回のように、

1. マッチ情報を登録する
2. 落とし物を返却済みにする
3. 拾得物を返却済みにする

という複数の処理をまとめて行う場合に使用する。

---

## 2-3. Server Action

**Server Action** とは、

> **「画面から呼び出せる、サーバー側の処理」**

のこと。

今回の `assignFacility` は、

```text
画面で施設を選択
      ↓
Server Actionを呼ぶ
      ↓
PrismaでDBを更新する
```

という流れで処理を行う。

つまり、

> **画面から操作を受け取り、サーバー側でDBを変更するための関数**

と考えると分かりやすい。

---

# 2-4. キャッシュ

キャッシュとは、

> **一度表示したページの情報を、一時的に保存しておく仕組み**

のこと。

## 今回の場合

例えば、

```text
/found-items/8
```

を表示したとする。

そのとき、毎回DBに問い合わせるのではなく、

```text
DB
 ↓
拾得物8の情報を取得
 ↓
ページを表示
 ↓
その結果を一時的に保存（キャッシュ）
```

ということができる。

次に同じページを見るときは、保存しておいたものを使えるので、毎回DBから取得するより速く表示できる場合がある。

---

# 2-5. キャッシュが古くなる問題

例えば最初は、

```text
拾得物8
施設：未設定
```

だったとする。

そこで、

```typescript
await prisma.foundItem.update({
  where: { id: 8 },
  data: { facilityId: 3 },
})
```

を実行すると、DBは、

```text
拾得物8
施設：施設3
```

に変わる。

しかし、画面側に古いキャッシュが残っていると、

```text
DB   → 施設3
画面 → 未設定
```

となる可能性がある。

つまり、

> **DBは最新なのに、画面には古い情報が表示される**

という状態になる可能性がある。

---

# 2-6. `revalidatePath()` の役割

そこで、

```typescript
revalidatePath(`/found-items/${foundItemId}`)
```

を実行する。

これは、

> **「このページのキャッシュは古い可能性があるから、次に表示するときは最新の情報を使ってね」**

とNext.jsに伝える処理。

例えば `foundItemId` が `8` なら、

```typescript
revalidatePath(`/found-items/8`)
```

となる。

これによって、`/found-items/8` のページを次に表示するとき、最新のDB情報が反映されるようにする。

---

## 2-7. なぜ一覧ページも `revalidatePath()` するのか

次のように2つのページを更新対象にすることがある。

```typescript
revalidatePath(`/found-items/${foundItemId}`)
revalidatePath('/found-items')
```

それぞれの意味は、

```text
revalidatePath(`/found-items/${foundItemId}`)
↓
拾得物の詳細ページを更新対象にする

revalidatePath('/found-items')
↓
拾得物一覧ページを更新対象にする
```

ということ。

施設を割り当てた結果が、詳細ページだけでなく一覧ページにも表示される場合、**両方のページで最新情報を表示できるようにする必要がある。**

---

# 2-8. 全体の流れ

今回の `assignFacility` は、全体として次のような流れになっている。

```text
ユーザー
  ↓
画面で施設を選択
  ↓
Server Action
  ↓
assignFacility()
  ↓
Prisma
  ↓
DBのfacilityIdを更新
  ↓
revalidatePath()
  ↓
古いキャッシュを更新対象にする
  ↓
次にページを表示
  ↓
最新のDB情報を画面に反映
```

### 一言でまとめると

> **Server Actionでサーバー側からDBを更新し、`revalidatePath()` で変更に関係するページの古いキャッシュを更新対象にする。**

---
# 3-1. 認証機能の実装

## 3-1-1. 登録画面・ログイン画面

会員登録画面とログイン画面を作成した。

### 登録画面

ユーザーが以下の情報を入力して会員登録を行う。

- 名前
- メールアドレス
- パスワード
- 管理者コード（施設管理者の場合）
- 所属施設（管理者の場合）

登録処理では、入力されたパスワードをそのままDBに保存せず、`bcryptjs`を使用してハッシュ化してから保存する。

### ログイン画面

ユーザーがメールアドレスとパスワードを入力してログインする。

ログイン時には、入力されたパスワードとDBに保存されているハッシュ値を`bcryptjs`で照合する。

---

## 3-1-2. bcryptjs

`bcryptjs`（バクリプトJS）は、パスワードを安全に扱うためのライブラリである。

パスワードをそのままDBに保存すると、DBの情報が漏れた場合にパスワードも知られてしまう。

そのため、パスワードをハッシュ化してからDBに保存する。

```text
ユーザーがパスワードを登録
        ↓
bcryptjsでハッシュ化
        ↓
ハッシュ値をDBに保存
```

### ハッシュ化とは

元のパスワードを、そのままでは分からない別の文字列に変換することである。

例えば、

```text
入力されたパスワード
「password123」
        ↓
ハッシュ化
        ↓
「$2b$10$xxxxxxxxxxxxxxxx...」
```

のようになる。

DBには元のパスワードではなく、ハッシュ値を保存する。

---

## 3-1-3. bcryptjsを使った認証の流れ

今回の認証機能は、以下の流れで実装した。

```text
① パスワードをハッシュ化して保存する
   （会員登録時）

        ↓

② ログイン時に入力されたパスワードと
   DBのハッシュ値を照合する

        ↓

③ ログイン成功後、
   Cookieにログイン状態を保存する

        ↓

④ 各画面で「現在ログインしているユーザー」を
   取得できるようにする

        ↓

⑤ 既存のTODOであった
   「テストユーザーの決め打ち」や
   「管理者権限チェック」を
   実際のログインユーザーを使う仕組みに置き換える
```

---

# 3-2. bcryptのハッシュ化

## 3-2-1. `bcrypt.hash(password, 10)`

登録処理では以下のコードを使用する。

```ts
const passwordHash = await bcrypt.hash(password, 10)
```

これは、

> **入力されたパスワードをbcryptでハッシュ化する処理**

である。

### `password`

```ts
bcrypt.hash(password, 10)
```

最初の`password`は、ユーザーが入力したパスワードである。

```text
ユーザーが入力
「password123」
        ↓
password
        ↓
bcrypt.hash()
```

### `10`

`10`は、ハッシュ化するときの計算の大変さを決める値である。

この値は一般に「コスト」や「salt rounds」と呼ばれる。

```text
10 → 計算量が標準的
12 → 10より計算が重い
14 → さらに計算が重い
```

数字を大きくすると計算に時間がかかるため、パスワードの推測攻撃を行いにくくできる。

ただし、大きくしすぎるとログインや登録時の処理も遅くなる。

---

## 3-2-2. ソルトとは

「salt rounds」の`10`自体がソルトではない。

bcryptでは、以下の2つは別の意味を持つ。

```text
salt
↓
パスワードごとに追加されるランダムな値

rounds / cost
↓
ハッシュ計算の大変さを決める値
```

bcryptは、パスワードを安全にハッシュ化すると同時に、計算コストを設定することでパスワードを推測されにくくしている。

---

# 3-3. P2002エラー

## 3-3-1. P2002とは

`P2002`は、Prismaで発生する、

> **一意制約（UNIQUE制約）に違反したことを表すエラーコード**

である。

今回の`User`テーブルではメールアドレスに`@unique`を設定しているため、同じメールアドレスを登録しようとすると`P2002`が発生する。

```text
メールアドレス
taro@example.com
        ↓
すでにDBに存在
        ↓
同じメールアドレスで登録
        ↓
P2002
```

そのため、エラーを判定して、

```text
「このメールアドレスは既に使用されています」
```

と画面に表示するようにした。

---

# 3-4. フォームの入力チェック

## 3-4-1. `required`

HTMLの`required`は、

> **その入力欄を空欄のままフォーム送信できないようにする**

ための属性である。

例えば、

```tsx
<input
  name="email"
  type="email"
  required
/>
```

とすると、メールアドレスを入力しない状態ではフォームを送信できない。

---

## 3-4-2. `name`

フォームの入力欄には`name`を設定している。

```tsx
<input name="email" />
```

この`name`によって、Server Action側から、

```ts
formData.get('email')
```

として入力された値を取得できる。

つまり、

```text
<input name="email">
        ↓
フォーム送信
        ↓
FormData
        ↓
formData.get('email')
        ↓
入力されたメールアドレス
```

という関係になっている。

---

# 3-5. Cookieによるログイン状態の管理

## 3-5-1. Cookieとは

Cookie（クッキー）とは、

> **ブラウザに保存しておく小さな情報**

である。

ブラウザに情報を保存できるため、ログイン状態などを覚えておくために利用できる。

今回のアプリでは、Cookieを利用して、

> **どのユーザーがログインしているのか**

を判断できるようにする。

---

## 3-5-2. Cookieを使う理由

ログインした後、ページを移動するたびにメールアドレスやパスワードを入力してもらうのは不便である。

そこでログイン成功時にCookieへログイン情報を保存する。

```text
ログイン成功
    ↓
Cookieにログイン情報を保存
    ↓
別のページへ移動
    ↓
Cookieを確認
    ↓
「このユーザーはログイン中」
```

---

# 3-6. `sign()`による改ざん対策

## 3-6-1. なぜ`sign()`が必要なのか

Cookieの中身を単純に、

```text
session = 5
```

としてしまうと、ユーザーがCookieの値を変更して、

```text
session = 10
```

とする可能性がある。

そこで、`userId`に署名を付ける。

```text
Cookie
↓
userId + 署名
```

---

## 3-6-2. `sign()`とは

`sign()`は、

> **userIdに「この情報は本物ですよ」という印を付ける処理**

である。

例えば、

```ts
sign(5)
```

とすると、

```text
userId = 5
        ↓
秘密の鍵（AUTH_SECRET）を使って計算
        ↓
署名が作られる
        ↓
5.a8f7c3......
```

のような文字列になる。

この文字列をCookieに保存する。

---

## 3-6-3. 署名とは

署名とは、

> **「このデータは、秘密の鍵を持っているサーバーが作ったものですよ」という証明**

のようなものである。

例えば、

```text
5.a8f7c3......
```

というCookieがあった場合、サーバーは、

```text
userId = 5
      ＋
AUTH_SECRET
      ↓
もう一度署名を計算
```

する。

Cookieに入っている署名と、サーバーが計算した署名が一致すれば、

```text
「userId = 5は改ざんされていない」
```

と判断できる。

---

# 3-7. `verify()`による署名の確認

`sign()`が「署名を付ける処理」なのに対して、`verify()`は、

> **その署名が正しいか確認する処理**

である。

```text
sign()
↓
userIdに署名を付ける

Cookieに保存

↓
後でCookieを取得

↓
verify()
↓
署名が正しいか確認

↓
OK
↓
userIdを取得
```

例えば、

```text
5.a8f7c3......
```

を確認して、

```text
署名が一致
↓
userId = 5
```

となれば、ユーザーIDが5のユーザーとして処理する。

もし署名が一致しなければ、

```text
「Cookieが改ざんされている可能性がある」
```

として`null`を返す。

---

# 3-8. Cookieの有効期間

Cookieには有効期間を設定している。

```ts
maxAge: 60 * 60 * 24 * 7
```

これは、

```text
60秒 × 60分 × 24時間 × 7日
```

なので、

> **Cookieを7日間有効にする**

という意味である。

ログイン状態を永遠に残すのではなく、一定期間が経過したらログインし直すようにするために設定している。

---

# 3-9. Cookieが存在しない場合

現在のCookieを取得する処理では、

```ts
const value = cookieStore.get(COOKIE_NAME)?.value
```

としている。

`COOKIE_NAME`には、

```ts
const COOKIE_NAME = 'session'
```

が設定されているため、

```ts
cookieStore.get('session')
```

として`session`という名前のCookieを探している。

Cookieが存在しない場合、`get()`は`undefined`を返す。

そのため、

```ts
if (!value) return null
```

としている。

これは、

> **Cookieがなければログインしていないと判断して`null`を返す**

という処理である。

---

# 3-10. 登録画面を2ファイルに分けた理由

登録画面では、

```text
page.tsx
RegisterForm.tsx
```

の2つにファイルを分けている。

これは、

> **DBからデータを取得する処理と、ブラウザ上でフォームを操作する処理を分けるため**

である。

## `page.tsx`

```text
ページを表示する担当

↓

DBから施設一覧を取得

↓

RegisterFormに渡す
```

## `RegisterForm.tsx`

```text
フォームを表示する担当

↓

パスワードの表示・非表示

↓

管理者コードの入力

↓

施設の選択

↓

登録ボタンの操作
```

このように役割を分けることで、処理の内容を整理しやすくしている。

---

# 3-11. `page.tsx`の役割

`page.tsx`は、

> **そのURLのページを表示するためのファイル**

である。

例えば登録ページの`page.tsx`では、

```tsx
import { prisma } from '@/lib/prisma'
import { RegisterForm } from './RegisterForm'

export default async function RegisterPage() {
  const facilities = await prisma.facility.findMany({
    orderBy: { id: 'asc' }
  })

  return <RegisterForm facilities={facilities} />
}
```

としている。

処理の流れは、

```text
/registerにアクセス
        ↓
page.tsxが実行される
        ↓
Prismaで施設一覧を取得
        ↓
facilitiesに保存
        ↓
RegisterFormに渡す
        ↓
会員登録フォームが表示される
```

となる。

---

# 3-12. `LoginForm.tsx`の役割

`LoginForm.tsx`は、

> **ログイン画面のフォームを表示し、入力された情報をログイン処理へ送る担当**

である。

```text
メールアドレス入力
        ↓
パスワード入力
        ↓
「ログイン」を押す
        ↓
formAction
        ↓
auth.tsのlogin()
        ↓
DBのユーザーを確認
        ↓
パスワードを照合
        ↓
ログイン成功
        ↓
Cookieを作成
```

つまり、

```text
LoginForm.tsx
↓
入力・画面操作を担当

auth.ts
↓
実際のログイン処理を担当
```

という役割分担になっている。
## 3-13. bcryptjs追加時のDockerリビルド

### リビルドが不要な理由

今回は `pnpm add bcryptjs` でnpmパッケージを追加しただけなので、Dockerコンテナのリビルドは不要だった。

これまで `docker-compose.yml` や `Dockerfile` を変更した場合は、コンテナの土台となる設定が変わるため、イメージの再ビルド（Rebuild Container）が必要だった。

一方、`pnpm add bcryptjs` はコンテナ自体の設定を変更するものではなく、既存の `node_modules` にパッケージを追加する処理である。

また、`node_modules` はDocker Composeの名前付きボリュームとして管理されているため、パッケージを追加した時点でそのボリュームに `bcryptjs` がインストールされる。

そのため、今回はDockerコンテナを作り直す必要がなかった。

### 判断基準

- `Dockerfile` や `docker-compose.yml` を変更 → **リビルドが必要**
- `pnpm add` でパッケージを追加 → **基本的にリビルド不要**

なお、パッケージ追加後に開発サーバーで認識されない場合は、`pnpm dev` を再起動する。

### 学んだこと

Dockerのリビルドが必要かどうかは、「Dockerの土台となる設定を変更したか、それともコンテナ内のパッケージを追加しただけか」で判断できることを学んだ。