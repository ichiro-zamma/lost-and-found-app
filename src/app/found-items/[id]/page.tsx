//拾得物詳細画面
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/format'
import { STATUS_LABEL } from '@/lib/labels'//日本語の文字に変換
import { assignFacility } from '@/lib/actions/found-items'//拾得物詳細画面に「施設を設定」フォームを追加
import { getCurrentUser } from '@/lib/session' 

// const STATUS_LABEL: Record<string, string> = {
//   UNMATCHED: '未マッチング',
//   RETURNED: '返却済み',
// }

type Props = {
  params: Promise<{ id: string }>
}

export default async function FoundItemDetailPage({ params }: Props) {
  const { id } = await params

  const foundItem = await prisma.foundItem.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      color: true,
      location: true,
      facility: true,// 保管施設の情報。この画面では表示する必要があるので取得している
      user: true,
    },
  })

  if (!foundItem) notFound()
    // 該当データが無ければ404

   const facilities = await prisma.facility.findMany({ orderBy: { id: 'asc' } })
   //施設(facilities)のマスタデータを全部、登録順に取得する

   const currentUser = await getCurrentUser()
  return (
    <div className="p-8 mx-auto  max-w-2xl">
      <Link href="/found-items" className="text-blue-600 hover:underline text-sm">
        ← 拾得物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        {foundItem.category.categoryName}の拾得物
      </h1>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <tbody>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left w-40">種類</th>
            <td className="border border-gray-300 px-4 py-2">{foundItem.category.categoryName}</td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">色</th>
            <td className="border border-gray-300 px-4 py-2">{foundItem.color.colorName}</td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">拾得場所</th>
            <td className="border border-gray-300 px-4 py-2">
              {foundItem.location.locationName}
              {foundItem.locationDetail && `(${foundItem.locationDetail})`}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">拾得日時</th>
            <td className="border border-gray-300 px-4 py-2">
              {formatDateTime(foundItem.foundAt)}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">保管施設</th>
            <td className="border border-gray-300 px-4 py-2">
              {foundItem.facility ? foundItem.facility.facilityName : '未定(施設に届いていません)'}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">登録者</th>
            <td className="border border-gray-300 px-4 py-2">
              {foundItem.user.name}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">ステータス</th>
            <td className="border border-gray-300 px-4 py-2">
              {STATUS_LABEL[foundItem.status]}
            </td>
          </tr>
        </tbody>
      </table>
     {currentUser?.role === 'ADMIN' && !foundItem.facility && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-3">保管施設を設定</h2>
          <form action={assignFacility.bind(null, foundItem.id)} className="flex gap-2">
            <select name="facilityId" required className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">施設を選択</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.facilityName}
                </option>
              ))}
            </select>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
              設定する
            </button>
          </form>
        </div>
      )}
    </div>
  )
}