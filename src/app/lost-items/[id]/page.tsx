//落とし物詳細画面
import { prisma } from '@/lib/prisma' // DB操作用の窓口
import { calculateMatchScore } from '@/lib/matching' // マッチングスコア計算関数
import { notFound } from 'next/navigation' // 404ページを表示するための関数
import Link from 'next/link' // ページ遷移用リンク
import { formatDateTime } from '@/lib/format' // 日時整形関数
import { STATUS_LABEL } from '@/lib/labels'//日本語の文字に変換
import { confirmReturn } from '@/lib/actions/matches'//「確定・返却」ボタンを追加
import { getCurrentUser } from '@/lib/session'//ログイン
import Image from 'next/image'//Next.jsの画像表示用のImageを使えるようにするため　Imageを使うことで画像の最適化などをNext.js側に任せられる

// const STATUS_LABEL: Record<string, string> = {
//      // ステータスのenum値を日本語に変換する辞書
//   UNMATCHED: '未マッチング',
//   RETURNED: '返却済み',
// }

type Props = {
  params: Promise<{ id: string }>
  // このページに渡ってくるURLパラメータの型定義
  // 例: /lost-items/5 にアクセスすると { id: "5" } が渡ってくる
}

export default async function LostItemDetailPage({ params }: Props) {
    // Propsからparamsだけを取り出して使う(分割代入)
  const { id } = await params
  // paramsはPromiseなのでawaitで中身を取り出す。idという文字列(例:"5")が手に入る
     
  // URLのidが数字でなければ404ページを表示
  if (!/^\d+$/.test(id)) {
    notFound()
  }

  const lostItem = await prisma.lostItem.findUnique({
     // lost_itemsテーブルから、主キーで1件だけ検索する
    where: { id: Number(id) },
    // URLの id は文字列("5")なので、Number()で数値(5)に変換してから検索条件に使う
    include: {
        //includeがあると、IDを手がかりにして、そのIDが指す先の詳細な情報(名前など)まで、まとめて取得できる
      category: true,// カテゴリ名を一緒に取得
      color: true,// 色名を一緒に取得
      location: true,// 場所名を一緒に取得
      user: true,// 登録者(利用者)の情報を一緒に取得
    },
  })

  if (!lostItem) notFound()
    // もし該当するデータが無かった(findUniqueがnullを返した)場合、404ページを表示して処理を止める

  const currentUser = await getCurrentUser()
  // 現在ログインしているユーザーを取得

  // マッチング候補: まだ返却済みでない拾得物を全件取得し、その場でスコアを計算する
  const foundItems = await prisma.foundItem.findMany({
    // found_itemsテーブルから複数件取得する
    where: { status: { not: 'RETURNED' },
    // ステータスがRETURNED(返却済み)でないものだけに絞り込む
    // { not: '...' } はPrismaの「等しくない」という条件の書き方
    categoryId: lostItem.categoryId,
    //拾得物のcategoryIdが、現在見ている落とし物のcategoryIdと同じものだけ取得して
    },
    include: {
      category: true,
      color: true,
      location: true,
      facility: true, // 保管施設の情報も一緒に取得(あれば)
    },
  })

  const candidates = foundItems
    .map((foundItem) => ({
      foundItem,
      score: calculateMatchScore(lostItem, foundItem),
      // 取得した拾得物1件ずつに対して、今表示している落とし物とのスコアを計算し、
      // { foundItem: (元のデータ), score: (計算結果) } という新しいオブジェクトの配列に変換する
    }))
    .filter((candidate) => candidate.score > 0) 
    // スコアが0点(何も一致点がない)ものは、配列から除外する
    // 少しでも一致点があるものだけ表示

    .sort((a, b) => b.score - a.score)
    // スコアが高い順に並び替える
    // sortの比較関数: 戻り値がマイナスならaが先、プラスならbが先になる
    // b.score - a.score にすることで、大きい方(高スコア)が先頭に来る(降順)

  return (
    <div className="p-8 mx-auto  max-w-2xl">
      <Link href="/lost-items" className="text-blue-600 hover:underline text-sm">
        ← 落とし物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        {lostItem.category.categoryName}の落とし物
      </h1>
         {lostItem.imageUrl && (
  <div className="w-80 h-80 mx-auto mb-6 overflow-hidden rounded border border-gray-300">
    <Image
      src={lostItem.imageUrl}
      // 表示する画像の場所(URL)
      alt="落とし物の写真"
      // 画像が表示できない場合などの説明文
      width={320}
      // 画像の幅
      height={320}
      // 画像の高さ
      className="w-full h-full object-contain"
       // w-full：親の横幅いっぱい
       // h-full：親の高さいっぱい
       // object-contain：画像全体が見えるように表示
    />
  </div>
)}

      <table className="w-full border-collapse border border-gray-300 text-sm mb-8">
        <tbody>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left w-40">種類</th>
            <td className="border border-gray-300 px-4 py-2">{lostItem.category.categoryName}</td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">色</th>
            <td className="border border-gray-300 px-4 py-2">{lostItem.color.colorName}</td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">紛失場所</th>
            <td className="border border-gray-300 px-4 py-2">
              {lostItem.location.locationName}
              {lostItem.locationDetail && `(${lostItem.locationDetail})`}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">紛失日時</th>
            <td className="border border-gray-300 px-4 py-2">
                  {formatDateTime(lostItem.lostAt)}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">登録者</th>
            <td className="border border-gray-300 px-4 py-2">
              {lostItem.user.name }
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">ステータス</th>
            <td className="border border-gray-300 px-4 py-2">
              {STATUS_LABEL[lostItem.status]}
            </td>
          </tr>

          {currentUser?.role === 'ADMIN' && (
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">本人確認用の秘密情報</th>
            <td className="border border-gray-300 px-4 py-2">{lostItem.secretInfo}</td>
          </tr>
        )}
        </tbody>
      </table>

    {lostItem.status !== 'RETURNED' && (
      <section>
        <h2 className="text-lg font-semibold mb-3">
          マッチング候補({candidates.length}件)
        </h2>

        {candidates.length === 0 ? (
          <p className="text-gray-500 text-sm">現時点で一致する拾得物は見つかっていません</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {candidates.map(({ foundItem, score }) => (
              <li key={foundItem.id} className="border border-gray-300 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {foundItem.category.categoryName} / {foundItem.color.colorName}
                  </span>
                  <span className="text-sm font-bold text-blue-600">一致度 {score}%</span>
                  {/* <span className="text-xl font-bold text-blue-600">一致度 {score}%</span> */}
                </div>

                {foundItem.imageUrl && (
                          <div className="w-52 h-52  mb-6 overflow-hidden rounded border border-gray-300">
                            <Image
                              src={foundItem.imageUrl}
                              alt="拾得物の写真"
                              width={320}
                              height={320}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                <p className="text-sm text-gray-700">
                  拾得場所: {foundItem.location.locationName}
                  {foundItem.locationDetail && `(${foundItem.locationDetail})`}
                </p>
                <p className="text-sm text-gray-700">
                  拾得日時: {formatDateTime(foundItem.foundAt)}
                </p>
                <p className="text-sm text-gray-700">
                  保管施設: {foundItem.facility ? foundItem.facility.facilityName : '未定(まだ施設に届いていません)'}
                </p>
                {currentUser?.role === 'ADMIN' && foundItem.facility && (
                   // 現在ログインしている人がADMIN（管理者）で、
                   // かつ拾得物を預かっている施設がある場合だけ、以下を表示する
                  <form action={confirmReturn} className="mt-3">
                    {/* // フォームを作る
                    // 送信すると confirmReturn というServer Actionを実行する
                    // mt-3：フォームの上に少し余白をつける */}
                    <input type="hidden" name="lostItemId" value={lostItem.id} />
                    {/* // hidden：画面には表示しない
                        // name="lostItemId"：送るデータの名前は「lostItemId」
                        // value={lostItem.id}：その中身は、今見ている落とし物のID */}
                    <input type="hidden" name="foundItemId" value={foundItem.id} />
                   {/* confirmReturn に、
                     「どの落とし物と、どの拾得物を返却済みにするの？」を伝えるためIDを送ってる */}
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                    >
                      本人確認完了・返却済みにする
                    </button>
                  </form>
                  // type="submit" ＝ 「このボタンを押したらフォームを送信するボタンですよ」
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      )}

       {currentUser?.role !== 'ADMIN' && (
         <p className="mt-4 text-xs text-gray-400">
           本人確認用の秘密情報は、施設管理者のみが照合時に確認します。この画面には表示していません。
         </p>
        )}
    </div>
  )
}