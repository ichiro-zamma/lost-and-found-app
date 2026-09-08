import { prisma } from '@/lib/prisma'
import { calculateMatchScore } from '@/lib/matching'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime } from '@/lib/format'

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

  // マッチング候補: まだ返却済みでない拾得物を全件取得し、その場でスコアを計算する
  const foundItems = await prisma.foundItem.findMany({
    where: { status: { not: 'RETURNED' } },
    include: {
      category: true,
      color: true,
      location: true,
      facility: true,
    },
  })

  const candidates = foundItems
    .map((foundItem) => ({
      foundItem,
      score: calculateMatchScore(lostItem, foundItem),
    }))
    .filter((candidate) => candidate.score > 0) // 少しでも一致点があるものだけ表示
    .sort((a, b) => b.score - a.score)

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/lost-items" className="text-blue-600 hover:underline text-sm">
        ← 落とし物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        {lostItem.category.categoryName}の落とし物
      </h1>

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
                </div>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 text-xs text-gray-400">
        本人確認用の秘密情報は、施設管理者のみが照合時に確認します。この画面には表示していません。
      </p>
    </div>
  )
}