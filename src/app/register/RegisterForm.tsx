//名前・メールアドレス・パスワード・管理者情報を入力して会員登録できる画面を作っている
'use client'
// ↑このファイルはブラウザ側（クライアント側）で動くコンポーネントだと指定 
// // useStateやuseActionStateなど、ブラウザで動く機能を使うために必要

import { useActionState, useState } from 'react'
//Reactから機能を読み込む 
// useActionState → Server Actionの実行・結果・実行中状態を管理する 
// useState → 画面上の状態を管理する
import { register } from '@/lib/actions/auth'
//会員登録を行うServer Action「register」を読み込む
import Link from 'next/link'
//Next.jsのページ遷移用Linkを読み込む

//施設データの「型」を定義 
type Facility = {
  id: number // id → 数字 
  facilityName: string // facilityName → 文字列
}

//RegisterFormが受け取るデータの型を定義 
type Props = {
  facilities: Facility[] // facilities → Facility型のデータを複数持つ配列
}

export function RegisterForm({ facilities }: Props) {
    //会員登録フォームのコンポーネント // 親ページから「施設一覧」をfacilitiesとして受け取る
  const [state, formAction, isPending] = useActionState(register, undefined)
  //registerというServer Actionをフォームから実行できるようにする
  // formAction → <form action={formAction}> に指定して、フォーム送信時にregisterを実行する 
  //  isPending → Server Actionを実行中ならtrue  実行中でなければfalse 
  // undefined  → 最初はまだregisterを実行していないので初期値はundefined


  const [showPassword, setShowPassword] = useState(false)
  // ↑ パスワードを「表示する / 隠す」を管理する 
  // showPassword = 現在の状態 // setShowPassword = showPasswordを変更する関数 
   // false → パスワードを隠す // true → パスワードを表示する
  const [isAdmin, setIsAdmin] = useState(false)
  //管理者コードが入力されているかを管理する 
  // //false → 一般ユーザー // true → 管理者として扱う

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">会員登録</h1>

      {state?.error && (
        <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">名前</label>
          <input name="name" required className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">メールアドレス *</label>
          <input name="email" type="email" required className="border border-gray-300 rounded px-3 py-2 text-sm" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">パスワード(8文字以上) *</label>
          <div className="flex gap-2">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
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

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            管理者コード<span className="text-gray-400">(施設の管理者のみ入力)</span>
          </label>
          <input
            name="adminCode"
            type="text"
            onChange={(e) => setIsAdmin(e.target.value.length > 0)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">所属施設 *</label>
            <select
              name="facilityId"
              required={isAdmin}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.facilityName}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 mt-2 disabled:opacity-50"
        >
          {isPending ? '登録中...' : '登録する'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        すでにアカウントをお持ちですか?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}