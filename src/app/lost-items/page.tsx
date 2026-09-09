//落とし物一覧
import { prisma } from '@/lib/prisma' // DB操作用の窓口(シングルトン)を持ってくる
import Link from 'next/link' // ページ遷移用のリンクコンポーネント
import { formatDateTime } from '@/lib/format' // 自作した日時整形関数

const STATUS_LABEL: Record<string, string> = {
    // enumの値(英単語)を、日本語の表示名に変換するための対応表
    // Record<string, string> = 「キーも値も文字列であるオブジェクト」という型
  UNMATCHED: '未マッチング',
  CONFIRMING: '確認中',
  RETURNED: '返却済み',
}

export default async function LostItemsPage() {
    // 一覧画面のServer Component本体
  const lostItems = await prisma.lostItem.findMany({
    // lost_itemsテーブルから複数件取得する
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">落とし物一覧</h1>
        <Link
          href="/lost-items/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      {lostItems.length === 0 ? (
        <p className="text-gray-500">落とし物が登録されていません</p>
      ) : (
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
              <tr key={lostItem.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <Link href={`/lost-items/${lostItem.id}`} className="text-blue-600 hover:underline">
                    {lostItem.category.categoryName}
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">{lostItem.color.colorName}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {lostItem.location.locationName}
                  {lostItem.locationDetail && `(${lostItem.locationDetail})`}
                </td>

                <td className="border border-gray-300 px-4 py-2">
                     {formatDateTime(lostItem.lostAt)}  
                </td>
            
                <td className="border border-gray-300 px-4 py-2">
                  {STATUS_LABEL[lostItem.status]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-4 text-sm text-gray-500">合計: {lostItems.length}件</p>
    </div>
  )
}