//落とし物登録画面
import { prisma } from '@/lib/prisma' // DB操作用の窓口(シングルトン)を持ってくる// → データベースを操作するために使う
import { redirect } from 'next/navigation' // 処理後に別ページへ飛ばすための関数
import Link from 'next/link'  // ページ遷移用のリンクコンポーネント
import { getCurrentUser } from '@/lib/session' // getCurrentUser → 現在ログインしているユーザーを取得する関数
import { saveUploadedImage } from '@/lib/upload' //画像を保存するために作ったsaveUploadedImageという関数を入れている// → ユーザーが登録した画像を保存するときに使う
import { getStringField, getOptionalStringField } from '@/lib/formData'

// max属性の計算を、日本時間(JST)に補正する
// → 日時入力欄の「これより先の日時は入力できない」という上限を日本時間に合わせる
function getLocalDateTimeString(): string {
  // function → 関数を作る
// getLocalDateTimeString → 関数の名前
// (): → この関数は何も受け取らない
// : string → 文字列（string）を返す関数
  const now = new Date()  //→ 現在の日時を取得
  const jstOffsetMs = 9 * 60 * 60 * 1000 // 日本時間は常にUTCより9時間進んでいる
  // 9時間をミリ秒に変換
  // 9 → 9時間
  // 60 → 1時間 = 60分
  // 60 → 1分 = 60秒
  // 1000 → 1秒 = 1000ミリ秒
  // 結果：32,400,000ミリ秒
  //「9時間」をミリ秒に変換する計算
  //なぜミリ秒にするの？//JavaScriptのDateでは、日時をミリ秒単位で扱うことが多いからです。　より細かい時間まで扱えるようにするため
  const jstTime = new Date(now.getTime() + jstOffsetMs)
  // now.getTime() → 現在日時をミリ秒の数字に変換
  // + jstOffsetMs → 9時間分のミリ秒を足す
  // new Date(...) → 計算した数字を日時に戻す
  // jstTime → 日本時間に9時間分補正した日時
  return jstTime.toISOString().slice(0, 16)
   // toISOString() → 日時を文字列に変換
  // 例：2026-09-17T00:20:00.000Z
  // slice(0, 16) → 最初の16文字だけ取り出す
  // 結果：2026-09-17T00:20
  // return → この文字列を関数の呼び出し元に返す
}

// このページ自体がServer Component(asyncが付いているのでサーバー上でDBに直接アクセスできる)
export default async function NewLostItemPage() {

    //「このページを見るにはログインが必要」
    // ↓ ここに追加(ページ全体のログインチェック)
    //pageUser → ページを見るためのログイン確認 → ログインしているか確認する
  const pageUser = await getCurrentUser()
   // getCurrentUser()
  // → 現在ログインしているユーザーを取得する
  // await
  // → getCurrentUser()の処理が終わるまで待つ
  if (!pageUser) {
    // pageUserが存在しないなら
    // → ログインしていないなら
    redirect('/login')
    // → ログインページへ移動させる
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
    //「この関数をフォームなどから呼び出せるServer Actionにする」

    const categoryId = Number(formData.get('categoryId'))
    // formDataから"categoryId"という名前で送られてきた値を取り出し、文字列→数値に変換
    const colorId = Number(formData.get('colorId'))
        // 同様に色のIDを取り出し数値化
    const locationId = Number(formData.get('locationId'))
    // 同様に場所のIDを取り出し数値化
    const locationDetail = getOptionalStringField(formData, 'locationDetail')
    // 場所の詳細(自由記述)を文字列として取り出す
    // "as string" はTypeScriptへの型の指定(FormDataの値は本来 string | File | null の可能性があるため)
    //FormDataは、<form>タグで送信された内容を、ひとまとめに管理するJavaScriptの仕組みです。
    const lostAtRaw = getStringField(formData, 'lostAt')
    // 紛失日時を、まだ文字列のまま取り出す("Raw"=加工前、という意味を込めた変数名)
    const secretInfo = getStringField(formData, 'secretInfo')
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


    //実際に落とし物を登録する瞬間にも、ログインしているか確認する
    //currentUser → 登録処理をする人を特定するためのログイン確認
    //安全のために必要　二重チェック＋登録者の特定
    //getCurrentUser() → 今ログインしているユーザーを確認する
    // currentUser→ 確認できたユーザーの情報を入れておく変数
    const currentUser = await getCurrentUser()
          if (!currentUser) {
      throw new Error('ログインが必要です')
    }

    //ユーザーが選んだ画像を取り出して、保存する」処理    
    const imageFile = formData.get('image') as File | null
    // フォームから「image」という名前のデータを取り出す
    const imageUrl = await saveUploadedImage(imageFile)
    //取り出した画像をsaveUploadedImageに渡して保存する

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
        imageUrl,  //保存した画像の場所を、落とし物データと一緒にDBへ保存する
      },
    })

    redirect(`/lost-items/${lostItem.id}`)
    // 登録が終わったら、作成された落とし物の詳細ページへ強制的に画面遷移させる
    // lostItem.id には、DBが自動採番したIDがここで初めて手に入る(createの戻り値だから)

  }

  //required ユーザーが入力し忘れないようにするための画面側のチェック
  //スキーマは、「DBに保存するデータとして必須かどうかを決める」
  return (
    // 画面全体の入れ物
    <div className="p-8 mx-auto max-w-xl">
       {/* // p-8：内側に余白
    　　　　// mx-auto：左右中央寄せ
    　　　　// max-w-xl：横幅を広げすぎない */}
      <Link href="/lost-items"// クリックしたら落とし物一覧へ
       className="text-blue-600 hover:underline text-sm"> 
        ← 落とし物一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">落とし物を登録</h1>

    {/* // フォーム
     // action={createLostItem}：送信されたらcreateLostItemを実行 */}
      <form action={createLostItem} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">種類 *</label>
          <select
            name="categoryId"
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">選択してください</option>
            {/* // 最初に表示される選択肢// value=""：値は空 */}
            {categories.map((category) => (
              // categoriesに入っている種類を1つずつ取り出して
              // <option>を作る
              <option key={category.id} value={category.id}>
                {category.categoryName} 
              </option>
              // 画面に表示する種類名
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
            placeholder="例: 渋谷駅の改札口付近" // 入力前に表示する例
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">紛失日時 *</label>
          <input
            name="lostAt" // 送信時の名前
            type="datetime-local" // 日付＋時間を入力する欄
            required
            max={getLocalDateTimeString()}   // 現在時刻より未来を選べないようにする
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
            rows={3}  // 3行分の高さ
          />
        </div>


<div className="flex flex-col gap-1">
  <label className="text-sm font-medium">
    写真<span className="text-gray-400"/>
  </label>
  <input
    name="image"
    type="file" // ファイルを選択する入力欄
    accept="image/*" // 画像ファイルだけ選択できる
    className="text-sm border border-gray-300 rounded px-3 py-2 file:mr-3 file:px-3 file:py-1 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
     // ファイル選択ボタンの見た目を設定
  />
  <p className="text-xs text-gray-400 mt-1">
    ※ 財布や鞄を開いた状態、中身が写った写真は登録しないようにしてください。
  </p>
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