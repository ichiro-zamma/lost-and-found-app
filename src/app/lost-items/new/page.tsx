import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewLostItemPage() {
  // マスタデータを取得(プルダウンの選択肢用)
  const [categories, colors, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.color.findMany({ orderBy: { id: 'asc' } }),
    prisma.location.findMany({ orderBy: { id: 'asc' } }),
  ])

  async function createLostItem(formData: FormData) {
    'use server'

    const categoryId = Number(formData.get('categoryId'))
    const colorId = Number(formData.get('colorId'))
    const locationId = Number(formData.get('locationId'))
    const locationDetail = formData.get('locationDetail') as string
    const lostAtRaw = formData.get('lostAt') as string
    const secretInfo = formData.get('secretInfo') as string

    // TODO: 認証機能実装後、ログイン中のユーザーIDに置き換える
    const testUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'taro@example.com' },
    })

    const lostItem = await prisma.lostItem.create({
      data: {
        userId: testUser.id,
        categoryId,
        colorId,
        locationId,
        locationDetail: locationDetail || null,
        lostAt: new Date(lostAtRaw),
        secretInfo,
      },
    })

    redirect(`/lost-items/${lostItem.id}`)
  }

  return (
    <div className="p-8 max-w-xl">
      <Link href="/lost-items" className="text-blue-600 hover:underline text-sm">
        ← 落とし物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">落とし物を登録</h1>

      <form action={createLostItem} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">種類 *</label>
          <select
            name="categoryId"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">色 *</label>
          <select
            name="colorId"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.colorName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">紛失場所(大枠) *</label>
          <select
            name="locationId"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.locationName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">紛失場所の詳細</label>
          <input
            name="locationDetail"
            placeholder="例: 渋谷駅の改札口付近"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">紛失日時 *</label>
          <input
            name="lostAt"
            type="datetime-local"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">本人確認用の秘密情報 *</label>
          <textarea
            name="secretInfo"
            required
            maxLength={200}
            placeholder="例: 財布の中に犬の写真が入っている"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700"
          >
            登録する
          </button>
          <Link
            href="/lost-items"
            className="px-6 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}