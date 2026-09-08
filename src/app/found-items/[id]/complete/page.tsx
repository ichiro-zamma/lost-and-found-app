import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function FoundItemCompletePage({ params }: Props) {
  const { id } = await params

  const foundItem = await prisma.foundItem.findUnique({
    where: { id: Number(id) },
  })

  if (!foundItem) notFound()

  return (
    <div className="p-8 max-w-xl text-center">
      <div className="text-4xl mb-4">🙏</div>
      <h1 className="text-2xl font-bold mb-2">ご協力ありがとうございます!</h1>
      <p className="text-gray-600 mb-6">
        近くの施設(駅・学校など)に届けてください。<br />
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href={`/found-items/${foundItem.id}`}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
        >
          登録内容の詳細を見る
        </Link>
        <Link
          href="/found-items"
          className="px-6 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
        >
          一覧に戻る
        </Link>
      </div>
    </div>
  )
}