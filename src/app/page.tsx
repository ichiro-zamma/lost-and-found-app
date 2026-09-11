//トップページ
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'

export default async function HomePage() {
  const currentUser = await getCurrentUser()

  // 未ログインの場合
  if (!currentUser) {
    return (
      <div className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-6">落とし物管理アプリ</h1>
        <p className="text-gray-600 mb-6">
          落とし物・拾得物を登録して、マッチングを見つけましょう。
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded text-sm hover:bg-blue-700"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="border border-gray-300 px-6 py-3 rounded text-sm hover:bg-gray-50"
          >
            会員登録
          </Link>
        </div>
      </div>
    )
  }

  // 管理者の場合
  if (currentUser.role === 'ADMIN') {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-2">落とし物管理アプリ</h1>
        <p className="text-red-600 font-bold text-center mb-6">管理者用</p>

        <div className="flex flex-col gap-4">
          <Link
            href="/lost-items"
            className="border border-gray-300 rounded p-6 text-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium">落とし物一覧</span>
          </Link>
          <Link
            href="/found-items"
            className="border border-gray-300 rounded p-6 text-center hover:bg-gray-50"
          >
            <span className="text-lg font-medium">拾得物一覧</span>
          </Link>
        </div>
      </div>
    )
  }

  // 一般ユーザーの場合
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center mb-2">落とし物管理アプリ</h1>
      <p className="text-gray-600 text-center mb-6">
        ようこそ、{currentUser.name}さん
      </p>

      <div className="flex flex-col gap-4">
        <Link
          href="/lost-items"
          className="border border-gray-300 rounded p-6 text-center hover:bg-gray-50"
        >
          <span className="text-lg font-medium block mb-1">落とした人用</span>
          <span className="text-sm text-gray-500">落とし物を登録する・確認する</span>
        </Link>
        <Link
          href="/found-items"
          className="border border-gray-300 rounded p-6 text-center hover:bg-gray-50"
        >
          <span className="text-lg font-medium block mb-1">拾った人用</span>
          <span className="text-sm text-gray-500">拾得物を登録する・確認する</span>
        </Link>
      </div>
    </div>
  )
}