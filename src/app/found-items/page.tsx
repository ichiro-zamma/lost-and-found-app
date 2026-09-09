//拾得物一覧画面
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDateTime } from '@/lib/format'

const STATUS_LABEL: Record<string, string> = {
  UNMATCHED: '未マッチング',
  CONFIRMING: '確認中',
  RETURNED: '返却済み',
}

export default async function FoundItemsPage() {
  const foundItems = await prisma.foundItem.findMany({
     // found_itemsテーブルから複数件取得
    include: {
      category: true,
      color: true,
      location: true,
      facility: true,// 落とし物には無かった項目。保管施設の情報も一緒に取得
                     // facilityはリレーションが任意(?)なので、無ければnullが入る
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">拾得物一覧</h1>
        <Link
          href="/found-items/new"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      {foundItems.length === 0 ? (
        <p className="text-gray-500">拾得物が登録されていません</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-300">
              <th className="border border-gray-300 px-4 py-2 text-left">種類</th>
              <th className="border border-gray-300 px-4 py-2 text-left">色</th>
              <th className="border border-gray-300 px-4 py-2 text-left">場所</th>
              <th className="border border-gray-300 px-4 py-2 text-left">拾得日時</th>
              <th className="border border-gray-300 px-4 py-2 text-left">保管施設</th>
              <th className="border border-gray-300 px-4 py-2 text-left">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {foundItems.map((foundItem) => (
              <tr key={foundItem.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <Link href={`/found-items/${foundItem.id}`} className="text-blue-600 hover:underline">
                    {foundItem.category.categoryName}
                  </Link>
                </td>
                <td className="border border-gray-300 px-4 py-2">{foundItem.color.colorName}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {foundItem.location.locationName}
                  {foundItem.locationDetail && `(${foundItem.locationDetail})`}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {formatDateTime(foundItem.foundAt)}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {foundItem.facility ? foundItem.facility.facilityName : '未定'}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {STATUS_LABEL[foundItem.status]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-4 text-sm text-gray-500">合計: {foundItems.length}件</p>
    </div>
  )
}