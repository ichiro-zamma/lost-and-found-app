import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // 既存データを削除(子テーブル → 親テーブルの順)
  //外部キー制約があるテーブルは、参照している側(子)から先に消さないとエラーになるためこの順番。
  await prisma.match.deleteMany()
  await prisma.lostItem.deleteMany()
  await prisma.foundItem.deleteMany()
  await prisma.user.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.category.deleteMany()
  await prisma.color.deleteMany()
  await prisma.location.deleteMany()

  //マスタデータの一括登録
  // マスタデータ: カテゴリ
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

// テストユーザー(認証機能実装前の動作確認用)
const testUser = await prisma.user.create({
  data: {
    name: '山田太郎',
    email: 'taro@example.com',
    password: 'dummy-hashed-password',
    role: 'USER',
  },
})

// 施設(最低限1件)
const facility = await prisma.facility.create({
  data: { facilityName: '渋谷駅忘れ物センター', address: '東京都渋谷区渋谷2-24' },
})

// テスト用の施設管理者(認証機能実装前の動作確認用)
await prisma.user.create({
  data: {
    name: '管理者(渋谷駅)',
    email: 'admin-shibuya@example.com',
    password: 'dummy-hashed-password-admin',
    role: 'ADMIN',
    facilityId: facility.id, // これで facility が見つかる
  },
})

console.log('Seed data created successfully')
}

//main()の実行と、エラー処理
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    //prisma.$disconnect()(DBとの接続を閉じる)
  })
  