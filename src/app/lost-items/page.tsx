//落とし物一覧
import { prisma } from '@/lib/prisma' // DB操作用の窓口(シングルトン)を持ってくる
import Link from 'next/link' // ページ遷移用のリンクコンポーネント
import { formatDateTime } from '@/lib/format' // 自作した日時整形関数
import { STATUS_LABEL } from '@/lib/labels'//日本語の文字に変換
import { getCurrentUser } from '@/lib/session'//現在ログインしているユーザーを確認する関数
import { redirect } from 'next/navigation'//「別のページへ移動させる機能」

// const STATUS_LABEL: Record<string, string> = {
//     // enumの値(英単語)を、日本語の表示名に変換するための対応表
//     // Record<string, string> = 「キーも値も文字列であるオブジェクト」という型
//   UNMATCHED: '未マッチング',
//   RETURNED: '返却済み',
// }

export default async function LostItemsPage() {
    // 一覧画面のServer Component本体
    //ログインしているか？
    //currentUserは現在ログインしているもの
const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }
  const lostItems = await prisma.lostItem.findMany({
    // lost_itemsテーブルから複数件取得する
   where: currentUser.role === 'ADMIN' ? {} : { userId: currentUser.id }, 
   //管理者なら全部見る。一般ユーザーなら自分が登録したものだけ見る

   include: {
    //includeがあると、IDを手がかりにして、そのIDが指す先の詳細な情報(名前など)まで、まとめて取得できる
      category: true, // カテゴリ名などを一緒に取ってくる
      color: true,    // 色名などを一緒に取ってくる
      location: true,  // 場所名などを一緒に取ってくる
    },
    orderBy: { createdAt: 'desc' },
    // 登録日時(createdAt)の新しい順(desc)に並べる
  })
  return (
        <div className="p-8">
          {/* // 画面全体の入れ物
    　　　　　　// p-8：内側に余白をつける */}
      <div className="flex items-center justify-between mb-6">
        {/* // flex：中の要素を横並びにする
      　　　// items-center：上下方向の中央をそろえる
      　　　// justify-between：左右の端に離して配置
      　　　// mb-6：下に余白 */}
        <h1 className="text-2xl font-bold">落とし物一覧</h1>
        {currentUser?.role !== 'ADMIN' && (
          // 現在のユーザーが「管理者ではない」場合だけ表示する
        // ?.: currentUserがnullでもエラーにしない
        // !==：等しくない
        // &&：条件がtrueなら、その中身を表示
          <Link
            href="/lost-items/new"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            新規登録
          </Link>
        )}
      </div>

      {lostItems.length === 0 ? (
        // lostItemsの件数が0件なら
      // 「?」は条件によって表示を変える
        <p className="text-gray-500">落とし物が登録されていません</p>
        // 0件の場合に表示するメッセージ
      ) : (
        // 0件ではない場合はこちらを表示
        // <table> → 表全体
        // <thead> → 表の見出し
        // <tbody> → 表のデータ本体
        // <tr> → 1行
        // <th> → 見出しのマス
        // <td> → データのマス
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-300">
              <th className="border border-gray-300 px-4 py-2 text-left">種類</th>
              <th className="border border-gray-300 px-4 py-2 text-left">色</th>
              <th className="border border-gray-300 px-4 py-2 text-left">場所</th>
              <th className="border border-gray-300 px-4 py-2 text-left">紛失日時</th>
              <th className="border border-gray-300 px-4 py-2 text-left">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {lostItems.map((lostItem) => (
              // lostItemsの中から1件ずつ取り出して
            // それぞれ1行の<tr>を作る
              <tr key={lostItem.id} className="hover:bg-gray-50">
                 {/* // 1件の落とし物を1行として表示
                   // key：各行を識別するためのID */}
                <td className="border border-gray-300 px-4 py-2">
                  <Link href={`/lost-items/${lostItem.id}`} className="text-blue-600 hover:underline">
                  {/* // その落とし物の詳細ページへ移動
                      // 例：/lost-items/5 */}
                    {lostItem.category.categoryName}
                     {/* // カテゴリ名を表示
                        // 例：「財布」「スマホ」 */}
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">{lostItem.color.colorName}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {lostItem.location.locationName}
                  {lostItem.locationDetail && `(${lostItem.locationDetail})`}
                </td>

                <td className="border border-gray-300 px-4 py-2">
                     {formatDateTime(lostItem.lostAt)}  
                      {/* // 紛失日時を表示
                          // formatDateTime：日時を見やすい日本語形式などに変換する関数 */}
                </td>

            
                <td className="border border-gray-300 px-4 py-2">
                  {STATUS_LABEL[lostItem.status]}
                </td>
                   {/* // ステータスを表示 */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-4 text-sm text-gray-500">合計: {lostItems.length}件</p>
    </div>
    // lostItems.length → 登録されている落とし物の件数
    // 例：3件なら「合計: 3件」
  )
}