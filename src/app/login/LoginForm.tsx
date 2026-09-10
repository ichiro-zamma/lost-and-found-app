//メールアドレスとパスワードを入力して、ログインするためのフォームを表示するコード
'use client'
//このコンポーネントをブラウザ側で動かす useStateやuseActionStateを使うために必要
import { useActionState, useState } from 'react'
//Reactの機能を読み込む
//useActionState→ ログイン処理の実行・結果・処理中かどうかを管理する 
//useState→ パスワードを表示するか隠すかなど、画面の状態を管理する
import { login } from '@/lib/actions/auth'
//auth.tsにある「login」というServer Actionを読み込む
import Link from 'next/link'
//Next.jsでページ移動するためのLinkを読み込む

export function LoginForm() {
    //ログインフォームのコンポーネント
  const [state, formAction, isPending] = useActionState(login, undefined)
  //loginをフォームから実行できるようにする 
  // state → loginの実行結果  例：{ error: 'メールアドレスまたはパスワードが正しくありません' } 
  // formAction → <form action={formAction}> に設定する フォームを送信するとloginが実行される 
  // isPending  → login処理中ならtrue  処理が終わればfalse 
  // undefined  → 最初はまだloginを実行していないので初期値はundefined
  const [showPassword, setShowPassword] = useState(false)
  // パスワードを表示するか隠すかを管理 
  // false → パスワードを隠す true → パスワードを表示する

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>

      {state?.error && (
        <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            name="email"
            type="email"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">パスワード</label>
          <div className="flex gap-2">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {showPassword ? '非表示' : '表示'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 mt-2 disabled:opacity-50"
        >
          {isPending ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        アカウントをお持ちでないですか?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          会員登録
        </Link>
      </p>
    </div>
  )
}