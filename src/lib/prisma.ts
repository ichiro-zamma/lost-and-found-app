//データベースを操作するためのPrismaClientを用意して、使い回せるようにしているファイル
import { PrismaPg } from '@prisma/adapter-pg'
// PrismaからPostgreSQLへ接続するためのアダプターを読み込む
import { PrismaClient } from '@/generated/prisma/client'
// DBを操作するためのPrismaClientを読み込む

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
// globalThis：アプリ全体で共有できる場所 
// prisma?: PrismaClient：PrismaClientを保存できるようにする 
// ?：prismaがまだ存在しない場合もある
export const prisma =
// prismaという名前で、他のファイルから使えるようにする 
// export：他のファイルでも使えるようにする
  globalForPrisma.prisma ??
  // すでにPrismaClientが保存されていれば、それを使う 
  // ??：左側があれば左側、なければ右側を使う
  new PrismaClient({
    // PrismaClientがまだなければ、新しく作る
    adapter: new PrismaPg({ 
      // PostgreSQLに接続するためのPrismaPgを設定する
      connectionString: process.env.DATABASE_URL! 
      // .envにあるDATABASE_URLを使ってDBの接続先を指定する 
      // !：DATABASE_URLは必ず存在するとTypeScriptに伝える
    }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// 本番環境ではない場合（開発環境など） globalForPrisma.prisma = prisma 
// 作ったPrismaClientをglobalThisに保存する 
// 次回も同じPrismaClientを使えるようにする

//今、本番環境ではないなら
//Prismaをグローバルに保存する
// 開発環境 = 作っている途中
// 本番環境 = 実際に使ってもらう状態