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

//施設1件分のデータは「id」と「facilityName」を持つ
//施設データの「型」を定義 
type Facility = {
  id: number // id → 数字 
  facilityName: string // facilityName → 文字列
}

//RegisterFormが受け取るデータの型を定義 
type Props = {
  facilities: Facility[] // facilities → Facility型のデータを複数持つ配列 
  // 施設を複数入れた配列
}

export function RegisterForm({ facilities }: Props) {
    //会員登録フォームのコンポーネント // 親ページから「施設一覧」をfacilitiesとして受け取る
  const [state, formAction, isPending] = useActionState(register, undefined)
  //registerというServer Actionをフォームから実行できるようにする
  //state → register() の最新の処理結果 
  // formAction → <form action={formAction}> に指定して、フォーム送信時にregisterを実行する関数
  //  isPending → Server Action（register() ）を実行中ならtrue  実行中でなければfalse 
  // undefined  → 最初はまだregisterを実行していないので初期値はundefined


  const [showPassword, setShowPassword] = useState(false)
  // ↑ パスワードを「表示する / 隠す」を管理する 
  // showPassword = 現在の状態 // setShowPassword = showPasswordを変更する関数 
   // false → パスワードを隠す // true → パスワードを表示する
  const [isAdmin, setIsAdmin] = useState(false)
  //管理者コードが入力されているかを管理する 
  // //false → 一般ユーザー // true → 管理者として扱う

  return (
    // className = 「この要素にCSS（見た目の設定）をつける」　JSXでは className　classではない
    <div className="p-8 max-w-md mx-auto">
       {/* div：会員登録フォーム全体を囲む箱 */}
       {/* p-8：内側に32pxの余白をつける */}
       {/* max-w-md：最大幅を28rem（約448px）にする */}
       {/* mx-auto：左右の余白を自動にして中央寄せ */}
      <h1 className="text-2xl font-bold mb-6">会員登録</h1>
      {/* h1：ページの大きな見出し */}
      {/* text-2xl：文字を大きくする */}
      {/* font-bold：太字にする */}
      {/* mb-6：下に24pxの余白をつける */}


      {state?.error && (
        <p className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded mb-4">
          {state.error}
        </p>
      )}
        {/* state?.error：エラーが存在する場合だけ表示 */}
        {/* ?.：stateがundefinedでもエラーにならないようにする 　　もし state が存在するなら、その中の error を見て*/}
        {/* &&：左側がtrueなら右側を表示 */}
        {/* bg-red-50：薄い赤色の背景 */}
        {/* text-red-600：赤色の文字 */}
        {/* text-sm：文字を小さくする */}
        {/* px-4：左右に16pxの余白 */}
        {/* py-2：上下に8pxの余白 */}
        {/* rounded：角を丸くする */}
        {/* mb-4：下に16pxの余白 */}
        {/* {state.error}：実際のエラーメッセージを表示 */}

      <form action={formAction} className="flex flex-col gap-4">
      {/* form：ユーザーが入力するフォーム */}
      {/* action={formAction}：送信されたらformActionを実行する */}
      {/* formAction：useActionStateから取得したregister実行用の関数　register() = 会員登録処理 */}
      {/* flex：Flexboxを使う Flexbox 部品を並べる仕組み*/}
      {/* flex-col：子要素を縦方向に並べる */}
      {/* gap-4：子要素同士の間に16pxの間隔をつける */}

        <div className="flex flex-col gap-1">
        {/* 1つの入力項目を囲む箱 */}
        {/* flex：Flexboxを使用  */}
        {/* flex-col：labelとinputを縦に並べる */}
        {/* gap-1：間隔を4pxにする */}
          <label className="text-sm font-medium">名前</label>
        {/* label：入力欄の説明 */}
        {/* text-sm：文字を小さくする */}
        {/* font-medium：少し太めの文字 */}
          <input name="name" required className="border border-gray-300 rounded px-3 py-2 text-sm" />
        {/* input：名前を入力する欄 */}
        {/* name="name"：register()でformData.get('name')として取得するための名前 */}
        {/* required：入力必須にする */}
        {/* border：枠線をつける */}
        {/* border-gray-300：薄いグレーの枠線 */}
        {/* rounded：角を丸くする */}
        {/* px-3：左右に12pxの余白 */}
        {/* py-2：上下に8pxの余白 */}
        {/* text-sm：文字を小さくする */}
        </div>

        <div className="flex flex-col gap-1">
          {/* メールアドレス入力欄全体 */}
          <label className="text-sm font-medium">メールアドレス *</label>
           {/* 入力項目の名前 */}
          <input name="email" type="email" required className="border border-gray-300 rounded px-3 py-2 text-sm" />
        {/* name="email"：formData.get('email')で取得するための名前 */}
        {/* type="email"：メールアドレス形式で入力するようにする 　＠がないとブラウザ標準の警告*/}
        {/* required：入力必須 　空欄なら警告*/}
        {/* className：枠線・余白・文字サイズなどを設定 */}
        </div>

        <div className="flex flex-col gap-1">
          {/* パスワード入力欄全体 */}
          <label className="text-sm font-medium">パスワード(8文字以上) *</label>
          <div className="flex gap-2">
          {/* パスワード入力欄と表示ボタンを横並びにする */}
          {/* flex：Flexboxを使う */}
          {/* gap-2：要素同士の間隔を8pxにする */}
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
          {/* name="password"：formData.get('password')で取得する */}
          {/* type={showPassword ? 'text' : 'password'}：*/}
          {/* showPasswordがtrue → 普通の文字として表示 　'text'　*/}
          {/* false → パスワードを●●●で隠す 　'password'*/}
          {/* required：入力必須 */}
          {/* minLength={8}：8文字以上を要求 */}
          {/* flex-1：余った横幅をこのinputが使う */}

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {showPassword ? '非表示' : '表示'}
            </button>
          {/* type="button"：フォーム送信ボタンにはしない */}
          {/* onClick：クリックされたときの処理 */}
          {/* setShowPassword(!showPassword)： */}
          {/* true → false、false → true に切り替える */}
          {/* px-3：左右12pxの余白 */}
          {/* py-2：上下8pxの余白 */}
          {/* text-sm：小さい文字 */}
          {/* border：枠線 */}
          {/* rounded：角を丸くする */}
          {/* hover:bg-gray-50：マウスを乗せると薄いグレーになる */}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {/* 管理者コード入力欄全体 */}
          <label className="text-sm font-medium">
            管理者コード<span className="text-gray-400">(施設の管理者のみ入力)</span>
          </label>
          {/* span：ラベルの一部分だけ別のデザインにする */}
          {/* text-gray-400：薄いグレーの文字 */}
          <input
            name="adminCode"
            type="text"
            onChange={(e) => setIsAdmin(e.target.value.length > 0)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        {/* name="adminCode"：管理者コードとしてformDataから取得する */}
        {/* type="text"：普通の文字入力 */}
        {/* onChange：入力内容が変わるたびに実行 */}
        {/* e.target.value：現在入力されている文字 */}
        {/* .length：文字数 */}
        {/* length > 0：1文字以上入力されているか確認 */}
        {/* setIsAdmin(...)：isAdminの状態を変更する */}

        {/* つまり */}
        {/* 何も入力 → isAdmin = false */}
        {/* 1文字以上入力 → isAdmin = true */}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-1">
             {/* isAdminがtrueの場合だけ、この施設選択欄を表示する */}
            <label className="text-sm font-medium">所属施設 *</label>
            <select
              name="facilityId"
              required={isAdmin}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
            {/* select：選択肢から1つ選ぶ入力欄 */}
            {/* name="facilityId"：選択した施設IDをformDataから取得する */}
            {/* required={isAdmin}：管理者の場合だけ必須にする */}
            {/*<option>は <select> の中に入れる「選択肢」を作るタグです。 */}
              <option value="">選択してください</option>
              {/* 最初に表示される選択肢 */}
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.facilityName}
                </option>
              ))}
            {/* facilities：親ページから受け取った施設一覧 */}
            {/* map：施設を1件ずつ取り出してoptionを作る　配列を返す */}
            {/* key：Reactが各optionを区別するためのID */}
            {/* value：送信する施設ID */}
            {/* facility.facilityName：画面に表示する施設名 */}
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
      {/* type="submit"：フォームを送信するボタン */}
      {/* disabled={isPending}：登録処理中ならボタンを押せなくする */}
      {/* bg-blue-600：青い背景 */}
      {/* text-white：白い文字 */}
      {/* px-6：左右24pxの余白 */}
      {/* py-2：上下8pxの余白 */}
      {/* rounded：角を丸くする */}
      {/* text-sm：小さい文字 */}
      {/* hover:bg-blue-700：マウスを乗せると濃い青にする */}
      {/* mt-2：上に8pxの余白 */}
      {/* disabled:opacity-50：ボタン無効時に半透明にする */}
      </form>

      <p className="text-sm text-gray-500 mt-4">
        すでにアカウントをお持ちですか?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      {/* Link：Next.jsで別ページへ移動するためのリンク */}
      {/* href="/login"：ログインページへ移動 */}
      {/* text-blue-600：青色の文字 */}
      {/* hover:underline：マウスを乗せると下線を表示 */}
      </p>
    </div>
  )
}