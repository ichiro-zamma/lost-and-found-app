//共通ヘッダーを作るファイル
import Link from 'next/link'// Next.jsのページ移動用のLinkを読み込む
import { getCurrentUser } from '@/lib/session'// Cookieからログイン中のユーザー情報を取得する関数を読み込む
import { logout } from '@/lib/actions/auth'// ログアウト処理を行う関数を読み込む

export async function Header() {
     // Headerコンポーネントを定義
  // asyncなので、DBからユーザー情報を取得できる
  const currentUser = await getCurrentUser()
  // 現在ログインしているユーザーを取得する
  // ログインしていなければ null が返ってくる

  return (
    <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg">
        落とし物管理アプリ
      </Link>

      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            {currentUser.role === 'ADMIN' && (
              <span className="text-red-600 font-bold text-sm">管理者用</span>
            )}
            <span className="text-sm text-gray-600">{currentUser.name}さん</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:underline"
              >
                ログアウト
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              ログイン
            </Link>
            <Link href="/register" className="text-sm text-blue-600 hover:underline">
              会員登録
            </Link>
          </>
        )}
      </div>
    </header>
  )
}