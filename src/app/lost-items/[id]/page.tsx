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

export default async function LostItemDetailPage({ params }: Props) {
  const { id } = await params

  const lostItem = await prisma.lostItem.findUnique({
    where: { id: Number(id) },
    include: {
      category: true,
      color: true,
      location: true,
      user: true,
    },
  })

  if (!lostItem) notFound()

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/lost-items" className="text-blue-600 hover:underline text-sm">
        ← 落とし物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        {lostItem.category.categoryName}の落とし物
      </h1>

      <table className="w-full border-collapse border border-gray-300 text-sm">
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
              {lostItem.lostAt.toLocaleString('ja-JP')}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">登録者</th>
            <td className="border border-gray-300 px-4 py-2">
              {lostItem.user.name ?? lostItem.user.email}
            </td>
          </tr>
          <tr>
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 text-left">ステータス</th>
            <td className="border border-gray-300 px-4 py-2">
              {STATUS_LABEL[lostItem.status]}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-4 text-xs text-gray-400">
        本人確認用の秘密情報は、施設管理者のみが照合時に確認します。この画面には表示していません。
      </p>
    </div>
  )
}