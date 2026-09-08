import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  UNMATCHED: '未マッチング',
  CONFIRMING: '確認中',
  RETURNED: '返却済み',
}

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
      facility: true,
      user: true,
    },
  })

  if (!foundItem) notFound()

  return (
    <div className="p-8 max-w-2xl">
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
              {foundItem.foundAt.toLocaleString('ja-JP')}
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
              {foundItem.user.name ?? foundItem.user.email}
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
    </div>
  )
}