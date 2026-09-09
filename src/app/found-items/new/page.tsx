//拾得物登録画面
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewFoundItemPage() {
  const [categories, colors, locations] = await Promise.all([
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.color.findMany({ orderBy: { id: 'asc' } }),
    prisma.location.findMany({ orderBy: { id: 'asc' } }),
  ])

  async function createFoundItem(formData: FormData) {
    'use server'
     // この関数もサーバー側で実行される、という宣言

    const categoryId = Number(formData.get('categoryId'))
    const colorId = Number(formData.get('colorId'))
    const locationId = Number(formData.get('locationId'))
    const locationDetail = formData.get('locationDetail') as string
    const foundAtRaw = formData.get('foundAt') as string

    // TODO: 認証機能実装後、ログイン中のユーザーIDに置き換える
    const testUser = await prisma.user.findUniqueOrThrow({
      where: { email: 'taro@example.com' },
    })

    const foundItem = await prisma.foundItem.create({
        // found_itemsテーブルに新しい行を1件作成する
      data: {
        userId: testUser.id,
        categoryId,
        colorId,
        locationId,
        locationDetail: locationDetail || null,
        foundAt: new Date(foundAtRaw),
        // facilityId はここでは設定しない(まだ施設に届けていない状態)
        // dataの中に facilityId を書いていない = 何も指定しない、という意味
        // schema.prisma で facilityId は Int? (任意)なので、
        // 指定しなければ自動的に NULL として保存される
        // これにより「まだどの施設にも届いていない」状態を表現している
      },
    })

    redirect(`/found-items/${foundItem.id}/complete`)
    // 登録が終わったら、詳細画面ではなく「完了画面」に遷移させる
  }

  return (
    <div className="p-8 max-w-xl">
      <Link href="/found-items" className="text-blue-600 hover:underline text-sm">
        ← 拾得物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">拾得物を登録</h1>

      <form action={createFoundItem} className="flex flex-col gap-4">
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
          <label className="text-sm font-medium">拾得場所(大枠) *</label>
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
          <label className="text-sm font-medium">拾得場所の詳細</label>
          <input
            name="locationDetail"
            placeholder="例: 渋谷駅の改札口付近"
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">拾得日時 *</label>
          <input
            name="foundAt"
            type="datetime-local"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
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
            href="/found-items"
            className="px-6 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}