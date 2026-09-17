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
  // state → loginの実行結果  例：{ error: 'メールアドレスまたはパスワードが正しくありません' } 　最新の処理結果今回はエラーのみ
  // formAction → <form action={formAction}> に設定する フォームを送信するとloginが実行される 
  // isPending  → login処理中ならtrue  処理が終わればfalse 
  // undefined  → 最初はまだloginを実行していないので初期値はundefined
  const [showPassword, setShowPassword] = useState(false)
  // パスワードを表示するか隠すかを管理 
  // false → パスワードを隠す true → パスワードを表示する

  return (
    <div className="p-8 max-w-md mx-auto">
       {/* 画面全体を囲む箱
        p-8       → 内側に32pxの余白
        max-w-md  → 最大幅を約448pxにする
        mx-auto   → 左右の余白を自動にして中央に配置 */}
      <h1 className="text-2xl font-bold mb-6">ログイン</h1>
      {/* h1 → ページの大きな見出し
        text-2xl → 文字を大きくする
        font-bold → 太字
        mb-6 → 下に24pxの余白 */}

      {state?.error && (
        <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
          {state.error}
        </p>
      )}
      {/* state?.error→ stateにerrorが入っているか確認
        errorがあれば <p> を表示する
        {state.error}→ エラーメッセージを表示
        例：「メールアドレスまたはパスワードが正しくありません」
        bg-red-50   → 薄い赤色の背景
        text-red-600 → 赤色の文字
        text-sm      → 小さい文字
        px-4         → 左右に16pxの余白
        py-2         → 上下に8pxの余白
        rounded      → 角を丸くする
        mb-4         → 下に16pxの余白 */}

      <form action={formAction} className="flex flex-col gap-4">
          {/* form → ログインフォーム
          action={formAction}
          → 送信されたらformActionを実行
          → formActionからlogin()が実行される
          flex       → Flexboxを使う　 Flexbox 部品を並べる仕組み
          flex-col   → 中身を縦に並べる
          gap-4      → 要素同士を16px空ける */}
        <div className="flex flex-col gap-1">
           {/* メールアドレス部分をまとめる箱
            flex       → Flexbox
            flex-col   → 縦に並べる
            gap-1      → 4px空ける */}
          <label className="text-sm font-medium">メールアドレス</label>
          {/* label → 入力欄の説明
            text-sm → 小さい文字
            font-medium → 少し太くする */}
          <input
            name="email"
            type="email"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {/* input → メールアドレスを入力する箱
            name="email"
            → この入力欄の名前
            → FormDataから「email」という名前で取得できる

            type="email"
            → メールアドレス用の入力欄
            → @がないなどの場合、ブラウザがチェックする
            required→ 必須入力
            border→ 枠線を付ける
            border-gray-300→ 枠線を薄い灰色にする
            rounded→ 角を丸くする
            px-3→ 左右12pxの余白
            py-2→ 上下8pxの余白
            text-sm→ 小さい文字 */}
        </div>

        <div className="flex flex-col gap-1">
          {/* パスワード部分をまとめる箱 */}
          <label className="text-sm font-medium">パスワード</label>
          {/* パスワード入力欄の説明 */}
          <div className="flex gap-2">
            {/* パスワード入力欄と「表示」ボタンを横に並べる
            　flex → Flexboxを使う
              gap-2 → 8pxの間隔を空ける */}
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            {/* input → パスワードを入力する箱
            　name="password"→ FormDataから「password」で取得できる
              type={showPassword ? 'text' : 'password'}
              → showPasswordがtrue
                 → type="text" → パスワードを見せる
                 showPasswordがfalse
                 → type="password" → パスワードを隠す
              required→ 必須入力
              flex-1→ 残っている横幅をできるだけ使う */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {showPassword ? '非表示' : '表示'}
            </button>
            {/* button → パスワード表示・非表示ボタン

              type="button"→ このボタンを押してもフォーム送信しない
              onClick→ ボタンをクリックしたときに実行

              setShowPassword(!showPassword)
              → showPasswordを反対にする
              false → true
              true → false

              {showPassword ? '非表示' : '表示'}
              → trueなら「非表示」
              → falseなら「表示」

              hover:bg-gray-50
              → マウスを乗せると背景が変わる */}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 mt-2 disabled:opacity-50"
        >
          {isPending ? 'ログイン中...' : 'ログイン'}
        </button>
        {/* type="submit"→ フォームを送信するボタン
        　　disabled={isPending}
          　→ ログイン処理中ならボタンを押せなくする
          isPending = true→ ボタン無効
          isPending = false→ ボタン有効

          {isPending ? 'ログイン中...' : 'ログイン'}
          → 処理中なら「ログイン中...」
          → 処理していなければ「ログイン」

          bg-blue-600→ 青い背景
          text-white→ 白い文字
          px-6→ 左右24pxの余白
          py-2→ 上下8pxの余白
          rounded→ 角を丸くする
          hover:bg-blue-700→ マウスを乗せると濃い青
          mt-2→ 上に8pxの余白
          disabled:opacity-50→ 無効中は透明度50%（薄くする） */}
      </form>

      <p className="text-sm text-gray-500 mt-4">
        アカウントをお持ちでないですか?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          会員登録
        </Link>
        {/*  手のマークになる　Link が自動的にリンクとして扱われるため */}
      </p>
      {/* p → 普通の文章
        text-sm→ 小さい文字
        text-gray-500→ 灰色の文字
        mt-4→ 上に16pxの余白
        {' '}→ 半角スペースを入れる　「ですか?」と「会員登録」の間を空けるため
        Link → 別のページへ移動するリンク
        href="/register"→ 会員登録ページへ移動
        text-blue-600→ 青色
        hover:underline→ マウスを乗せると下線が付く */}
    </div>
  )
}