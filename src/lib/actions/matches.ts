//「この落とし物と拾得物が実際に返却された」と確定する処理
'use server'
// 　 このファイルの処理を「サーバー側」で実行することを指定
//   データベースを操作する処理などに使う

import { prisma } from '@/lib/prisma'//Prismaを使ってデータベースを操作するためのprismaを読み込む
import { redirect } from 'next/navigation'//処理が終わったあと、別のページへ移動させるための関数
import { getCurrentUser } from '@/lib/session' 

export async function confirmReturn(formData: FormData) {
    // 返却確認を行う関数
    // async → データベースへの処理を待つ必要があるので付ける
    // formData → フォームから送られてきたデータ
  const lostItemId = Number(formData.get('lostItemId'))
    // フォームから「lostItemId」を取得する
    // Number(...) → 取得した値を数字に変換する
  const foundItemId = Number(formData.get('foundItemId'))
    //フォームから「foundItemId」を取得して数字に変換する

  // TODO: 認証機能実装後、role === 'ADMIN' のユーザーのみ実行できるようにする
  // ↓ TODOコメントを、実際のチェックに置き換える
  const currentUser = await getCurrentUser()
  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new Error('この操作には管理者権限が必要です')
  }

  await prisma.$transaction([
     //複数のデータベース処理を「1つのまとまり」として実行する
     // 途中でどれか1つが失敗した場合、
     // 基本的に処理全体を取り消すことができる

    // 今回は、
    // ① Matchを作成
    // ② 落とし物を返却済みにする
    // ③ 拾得物を返却済みにする
    // の3つをまとめて処理している

    prisma.match.create({
    //matchテーブルに新しいデータを登録する
      data: { lostItemId, foundItemId },
    //どの落とし物とどの拾得物がマッチしたのかを登録
    }),
    prisma.lostItem.update({
    //lostItemテーブルのデータを更新する
      where: { id: lostItemId },
      //更新する落とし物をidで指定する
      data: { status: 'RETURNED' },
      //statusを「RETURNED（返却済み）」に変更する
    }),
    prisma.foundItem.update({
      //foundItemテーブルのデータを更新する
      where: { id: foundItemId },
      //更新する拾得物をidで指定する
      data: { status: 'RETURNED' },
       //statusを「RETURNED（返却済み）」に変更する
    }),
  ])

  redirect(`/lost-items/${lostItemId}`)
  //データベースの処理が終わったら、
  //その落とし物の詳細ページへ移動する
}