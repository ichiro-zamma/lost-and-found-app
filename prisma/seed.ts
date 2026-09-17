//「DBを一度きれいにする → アプリで最初から必要なデータを入れ直す」

// .env に書いてある環境変数を読み込む dotenv
// DATABASE_URL などを使えるようにする
// dotenv　 .env の内容を扱うライブラリ
// config  設定を読み込むための機能
import 'dotenv/config'
// PostgreSQL用のPrismaアダプター
import { PrismaPg } from '@prisma/adapter-pg'
// PrismaでDBを操作するためのクライアント
import { PrismaClient } from '@/generated/prisma/client'
// パスワードをハッシュ化するためのライブラリ
import bcrypt from 'bcryptjs'

// PostgreSQLに接続するための設定 // process.env.DATABASE_URL：.envに設定したDB接続先 
// !：DATABASE_URLは必ず存在するとTypeScriptに伝える
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
// Prismaを使ってDBを操作できるようにする
const prisma = new PrismaClient({ adapter })

async function main() {
  // 既存データを削除 // ======================================== 
  // 子テーブル → 親テーブルの順番で削除する // 外部キーでつながっているため、親を先に消すとエラーになる場合がある
  // 既存データを削除(子テーブル → 親テーブルの順)
  //外部キー制約があるテーブルは、参照している側(子)から先に消さないとエラーになるためこの順番。
  await prisma.match.deleteMany()// Matchを全部削除
  await prisma.lostItem.deleteMany()
  await prisma.foundItem.deleteMany()
  await prisma.user.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.category.deleteMany()
  await prisma.color.deleteMany()
  await prisma.location.deleteMany()

  //マスタデータの一括登録
  // マスタデータ: カテゴリ
  // createMany()：複数のデータをまとめて登録する
  //await 「DBの処理が終わってから次の処理に進みたいから await を付けている」
  await prisma.category.createMany({
    data: [
    { categoryName: '財布' },
    { categoryName: 'スマートフォン' },
    { categoryName: '傘' },
    { categoryName: '鍵' },
    { categoryName: 'カバン・バッグ' },
    { categoryName: 'メガネ・サングラス' },
    { categoryName: '腕時計' },
    { categoryName: 'イヤホン・ヘッドホン' },
    { categoryName: '財布以外の貴重品(現金・カード類)' },
    { categoryName: '本・雑誌' },
    { categoryName: 'ノート・手帳' },
    { categoryName: '定期券・IDカード' },
    { categoryName: '衣類' },
    { categoryName: '帽子' },
    { categoryName: '手袋・マフラー' },
    { categoryName: 'アクセサリー' },
    { categoryName: 'ぬいぐるみ・おもちゃ' },
    { categoryName: 'PC・タブレット・USB' },
    { categoryName: 'カメラ' },
    { categoryName: 'その他' },
  ],
})

 
  // マスタデータ: 色
  // 色の選択肢をまとめて登録する
  await prisma.color.createMany({
    data: [
    { colorName: '黒' },
    { colorName: '白' },
    { colorName: 'グレー' },
    { colorName: '赤' },
    { colorName: 'ピンク' },
    { colorName: 'オレンジ' },
    { colorName: '黄' },
    { colorName: 'ベージュ' },
    { colorName: '茶' },
    { colorName: 'カーキ' },
    { colorName: '黄緑' },
    { colorName: '緑' },
    { colorName: 'エメラルドグリーン' },
    { colorName: '水色' },
    { colorName: '青' },
    { colorName: 'ネイビー' },
    { colorName: '紫' },
    { colorName: 'ラベンダー' },
    { colorName: '金' },
    { colorName: '銀' },
    { colorName: 'ゴールド(真鍮系)' },
    { colorName: '透明' },
    { colorName: '柄物・マルチカラー' },
    { colorName: '不明・その他' },
  ],
})

  // マスタデータ: 場所(シチュエーションの大枠)
  // 落とした場所・拾った場所の選択肢を登録する
  await prisma.location.createMany({
    data: [
      { locationName: '駅構内' },
      { locationName: '駅周辺' },
      { locationName: '電車内' },
      { locationName: 'バス内' },
      { locationName: '学校内' },
      { locationName: '公園内' },
      { locationName: '飲食店内' },
      { locationName: '商業施設内' },
      { locationName: 'その他' },
    ],
  })

// テストユーザー

// userテーブルにユーザーを1件登録する
// create()：1件のデータを登録する
const testUser = await prisma.user.create({
  data: {
    name: '山田太郎',
    email: 'taro@example.com',
    // パスワードをハッシュ化してからDBに保存する 
    // 'password123' → ハッシュ値に変換される // 10：ハッシュ化の計算コスト
    password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
    // このユーザーは一般ユーザー
    role: 'USER',
  },
})

// createMany() = マスタデータや施設など、まとめて登録したいとき
// create() = // → 1件登録するときに使う → 登録したデータのIDなどを後で使いたい場合にも便利

// 施設データを登録
// 渋谷駅の施設を1件登録 // 作成された施設の情報をshibuyaに保存する
const shibuya = await prisma.facility.create({
  data: {
    facilityName: '渋谷駅忘れ物センター',
    address: '東京都渋谷区渋谷2-24',
  },
})

const shinjuku = await prisma.facility.create({
  data: {
    facilityName: '新宿駅忘れ物センター',
    address: '東京都新宿区新宿3-38-1',
  },
})

const ikebukuro = await prisma.facility.create({
  data: {
    facilityName: '池袋駅忘れ物センター',
    address: '東京都豊島区南池袋1-28-2',
  },
})

const tokyo = await prisma.facility.create({
  data: {
    facilityName: '東京駅忘れ物センター',
    address: '東京都千代田区丸の内1-9-1',
  },
})

const shinagawa = await prisma.facility.create({
  data: {
    facilityName: '品川駅忘れ物センター',
    address: '東京都港区高輪3-26-27',
  },
})

// 施設管理者を登録
// 管理者を5人まとめて登録する
await prisma.user.createMany({
  data: [
    {
      name: '管理者(渋谷駅)',
      email: 'admin-shibuya@example.com',
      password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
      role: 'ADMIN',
      facilityId: shibuya.id,
    },
    {
      name: '管理者(新宿駅)',
      email: 'admin-shinjuku@example.com',
      password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
      role: 'ADMIN',
      facilityId: shinjuku.id,
    },
    {
      name: '管理者(池袋駅)',
      email: 'admin-ikebukuro@example.com',
      password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
      role: 'ADMIN',
      facilityId: ikebukuro.id,
    },
    {
      name: '管理者(東京駅)',
      email: 'admin-tokyo@example.com',
      password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
      role: 'ADMIN',
      facilityId: tokyo.id,
    },
    {
      name: '管理者(品川駅)',
      email: 'admin-shinagawa@example.com',
      password: await bcrypt.hash('password123', 10), // 本物のハッシュに変更
      role: 'ADMIN',
      facilityId: shinagawa.id,
    },
  ],
})

// データ登録がすべて成功したことをターミナルに表示
console.log('Seed data created successfully')
}

//main()の実行と、エラー処理
// main()でエラーが発生した場合 
// エラー内容を表示してプログラムを終了する
main()
  .catch((e) => { //main()でエラーが発生したら、ここで処理する eは発生したエラーの情報
    console.error(e)//そのエラー内容をターミナルに表示します。
    process.exit(1)//プログラムをエラー終了させる  0 → 正常終了 1 → エラー終了
  })
  //finally は、成功しても失敗しても、最後に必ず実行する
  .finally(async () => {
    await prisma.$disconnect() //Prismaとデータベースとの接続を終了する
    //もうDBを使わないので接続を閉じます
  })