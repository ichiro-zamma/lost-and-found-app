//落とし物登録画面
import { prisma } from '@/lib/prisma' // DB操作用の窓口(シングルトン)を持ってくる
import { redirect } from 'next/navigation' // 処理後に別ページへ飛ばすための関数
import Link from 'next/link'  // ページ遷移用のリンクコンポーネント
import { getCurrentUser } from '@/lib/session'

// max属性の計算を、日本時間(JST)に補正する
function getLocalDateTimeString(): string {
  const now = new Date()
  const jstOffsetMs = 9 * 60 * 60 * 1000 // 日本時間は常にUTCより9時間進んでいる
  const jstTime = new Date(now.getTime() + jstOffsetMs)
  return jstTime.toISOString().slice(0, 16)
}

// このページ自体がServer Component(asyncが付いているのでサーバー上でDBに直接アクセスできる)
export default async function NewLostItemPage() {

    //「このページを見るにはログインが必要」
    // ↓ ここに追加(ページ全体のログインチェック)
    //pageUser → ページを見るためのログイン確認
  const pageUser = await getCurrentUser()
  if (!pageUser) {
    redirect('/login')
  }

  // マスタデータを取得(プルダウンの選択肢用)
  const [categories, colors, locations] = await Promise.all([
    // Promise.all: 3つのDB問い合わせを同時に(並行して)実行し、全部終わるまで待つ
    // 順番に1つずつawaitするより速い(3つの通信を同時に走らせるため)
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    // categoriesテーブルを全件、id昇順で取得
    prisma.color.findMany({ orderBy: { id: 'asc' } }),
    // colorsテーブルを全件、id昇順で取得
    prisma.location.findMany({ orderBy: { id: 'asc' } }),
    // locationsテーブルを全件、id昇順で取得
  ])
    // 分割代入により、結果が順番通りに categories, colors, locations という変数に入る

  async function createLostItem(formData: FormData) {
    // フォーム送信時にサーバー側で実行される関数(Server Action)
    // 引数のformDataには、ユーザーが入力したフォームの内容が全部入っている
    'use server'
    // この関数はサーバー上で実行される、というNext.jsへの宣言

    const categoryId = Number(formData.get('categoryId'))
    // formDataから"categoryId"という名前で送られてきた値を取り出し、文字列→数値に変換
    const colorId = Number(formData.get('colorId'))
        // 同様に色のIDを取り出し数値化
    const locationId = Number(formData.get('locationId'))
    // 同様に場所のIDを取り出し数値化
    const locationDetail = formData.get('locationDetail') as string
    // 場所の詳細(自由記述)を文字列として取り出す
    // "as string" はTypeScriptへの型の指定(FormDataの値は本来 string | File | null の可能性があるため)
    //FormDataは、<form>タグで送信された内容を、ひとまとめに管理するJavaScriptの仕組みです。
    const lostAtRaw = formData.get('lostAt') as string
    // 紛失日時を、まだ文字列のまま取り出す("Raw"=加工前、という意味を込めた変数名)
    const secretInfo = formData.get('secretInfo') as string
    // 秘密情報を文字列として取り出す

    // "2026-09-10T15:29" という文字列に、日本時間であることを明示する "+09:00" を追加してからDateに変換する
    const lostAt = new Date(`${lostAtRaw}:00+09:00`)
    //JavaScriptが扱えるDate型に変換

  // 未来の日時が入力されていないかチェック
  if (lostAt.getTime() > Date.now()) {
    throw new Error('紛失日時に未来の日時は指定できません')
  }

  //max属性(フロント側) = 「利用者が、カレンダーUI上で未来日時をうっかり選べないようにする」入力補助
  //このコード(サーバー側) = 「万が一、max属性をすり抜けて未来日時が送られてきても、DBには絶対に保存させない」最終防衛ライン

    // // TODO: 認証機能実装後、ログイン中のユーザーIDに置き換える
    // // ↑ 後で直す必要がある箇所だと分かるようにした目印コメント
    // const testUser = await prisma.user.findUniqueOrThrow({
    //   where: { email: 'taro@example.com' },
    // })
    // // usersテーブルから、メールアドレスが taro@example.com の人を検索
    // // findUniqueOrThrow: 見つからなければエラーを投げる(findUniqueとの違いはここ)

    //実際に落とし物を登録する瞬間にも、ログインしているか確認する
    //currentUser → 登録処理をする人を特定するためのログイン確認
    //安全のために必要　二重チェック＋登録者の特定
    const currentUser = await getCurrentUser()
          if (!currentUser) {
      throw new Error('ログインが必要です')
    }

    const lostItem = await prisma.lostItem.create({
        // lost_itemsテーブルに新しい行を1件作成する
      data: {
        userId: currentUser.id,  // 登録者は現在ログインしているユーザー
        categoryId,           // カテゴリID(省略記法。categoryId: categoryId と同じ意味)
        colorId,              // 色ID(同上)
        locationId,           // 場所ID(同上)
        locationDetail: locationDetail || null,
        // locationDetailが空文字("")なら null に変換して保存する
        // (空文字のまま保存するより、"未入力"であることをNULLで表す方が自然なため)
        lostAt,// ← new Date(lostAtRaw) ではなく、上で作った変数 lostAt を使う
        // 文字列だった日時を、Dateオブジェクト(日時を扱うためのJavaScriptの型)に変換
        secretInfo,// 秘密情報
      },
    })

    redirect(`/lost-items/${lostItem.id}`)
    // 登録が終わったら、作成された落とし物の詳細ページへ強制的に画面遷移させる
    // lostItem.id には、DBが自動採番したIDがここで初めて手に入る(createの戻り値だから)

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
            max={getLocalDateTimeString()}
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