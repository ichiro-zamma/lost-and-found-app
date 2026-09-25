//ボタンを押した時、確認ポップアップを出してからconfirmReturnを呼ぶ
'use client'
// このコンポーネントをブラウザ側で動かすことを指定
import { confirmReturn } from '@/lib/actions/matches'
// 返却済みにする処理(confirmReturn)を読み込む

type Props = {
  lostItemId: number// 落とし物のID。数字として受け取る
  foundItemId: number// 拾得物のID。数字として受け取る
}

export function ConfirmReturnButton({ lostItemId, foundItemId }: Props) {
    // 返却確認ボタンを表示するコンポーネント
  return (
    <form
      action={confirmReturn}
       // フォームを送信したらconfirmReturnを実行する
       // 実際のDB更新処理はconfirmReturn側で行う
      onSubmit={(e) => {
       // フォームを送信するときに実行する処理
        const ok = confirm(
            // 「OK」か「キャンセル」を選択する確認画面を表示
          '本当に返却済みにしますか?\nこの操作は取り消せません。実物を本人に手渡したことを確認してから押してください。'
        )
        if (!ok) {
        // 「キャンセル」が押された場合
          e.preventDefault()
          // フォームの送信をキャンセルする
          // confirmReturnも実行されない
        }
      }}
      className="mt-3"
      // フォームの上に余白を付ける
    >
      <input type="hidden" name="lostItemId" value={lostItemId} />
      <input type="hidden" name="foundItemId" value={foundItemId} />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
      >
        本人確認完了・返却済みにする
      </button>
    </form>
  )
}