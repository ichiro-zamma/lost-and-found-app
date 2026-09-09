//「拾得物をどの施設が管理するかをDBに登録して、その変更を画面に反映する」処理
'use server'
//このファイルの処理をサーバー側で実行することを指定する

import { prisma } from '@/lib/prisma'//Prismaを使ってデータベースを操作するためのprismaを読み込む
import { revalidatePath } from 'next/cache'//指定したページのキャッシュを更新するための関数を読み込む

export async function assignFacility(foundItemId: number, formData: FormData) {
    //拾得物に施設を割り当てるためのServer　Action
     // foundItemId → 施設を割り当てる拾得物のID
     // formData→ フォームから送られてきたデータ
  const facilityId = Number(formData.get('facilityId'))
  //　フォームから「facilityId」を取得する
  // formData.get('facilityId') → フォームに入力されている施設IDを取得
  //Number(...)→ 取得した値を数字に変換する

  await prisma.foundItem.update({
    //foundItemテーブルのデータを更新する
    where: { id: foundItemId },
    //更新する拾得物をIDで指定する
    data: { facilityId },
    //その拾得物のfacilityIdを更新する
    // 例 facilityId が3なら、
    // 「この拾得物は施設3に割り当てられた」
    // という情報をDBに保存する
  })

  revalidatePath(`/found-items/${foundItemId}`)
  // 拾得物の詳細ページのキャッシュを更新する
  //
  // 例 foundItemId が8なら、
  // /found-items/8のページを最新のDBデータで表示できるようにする
  revalidatePath('/found-items')
  //拾得物一覧ページのキャッシュも更新する
  // 施設を割り当てた結果を一覧ページにも反映させる
}