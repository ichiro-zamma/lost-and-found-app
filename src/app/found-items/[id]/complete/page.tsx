//拾得物の登録完了画面
import { prisma } from '@/lib/prisma' // DB操作用の窓口
import { notFound } from 'next/navigation'  // 404ページ表示用の関数
import Link from 'next/link' // ページ遷移用リンク

type Props = {
  params: Promise<{ id: string }>
}

export default async function FoundItemCompletePage({ params }: Props) {
    // 完了画面のServer Component本体
  const { id } = await params
  // Promiseで渡ってきたparamsを待って、中身のidを取り出す

  const foundItem = await prisma.foundItem.findUnique({
    // found_itemsテーブルから、主キーで1件だけ検索する
    where: { id: Number(id) },
    // idは文字列("5")なので、Number()で数値に変換してから検索条件に使う

  // 注目ポイント: ここには include が付いていない
  // 詳細画面(page.tsx)では category や color も一緒に取得していたが、
  // この完了画面では、そもそもカテゴリ名や色を表示する予定がないため、
  // 必要最低限(foundItem自体の存在確認)だけで済ませている
  })

  if (!foundItem) notFound()
    // 該当する拾得物が存在しなければ404ページを表示

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
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