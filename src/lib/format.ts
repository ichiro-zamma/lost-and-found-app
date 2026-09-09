//日時表示の共通化
export function formatDateTime(date: Date): string {
    // export: 他のファイルからimportして使えるようにする
    // date: Date という引数を受け取り、string(文字列)を返す関数、という宣言
  const month = date.getMonth() + 1
  // Dateオブジェクトから「月」を取り出す
  // JavaScriptの仕様上、getMonth()は 0(1月)〜11(12月) という数字を返す
  // そのままだと「9月」のつもりが「8」と表示されてしまうため、+1して補正している
  const day = date.getDate()
  // Dateオブジェクトから「日」を取り出す(1〜31。こちらは+1不要、そのままの数字)
  const hour = date.getHours()
  // Dateオブジェクトから「時」を取り出す(0〜23)
  const minute = date.getMinutes().toString().padStart(2, '0')
  // Dateオブジェクトから「分」を取り出す(0〜59。これは数値)
  // .toString(): 数値を文字列に変換する(padStartは文字列にしか使えないメソッドのため)
  // .padStart(2, '0'): 文字列の長さが2に満たない場合、左側を'0'で埋める
  //   例: "5" → "05"、"26" → "26"(すでに2文字なのでそのまま)
  return `${month}月${day}日 ${hour}時${minute}分`
  // テンプレートリテラル(バッククォートで囲む書き方)
  // ${ } の中に変数を埋め込んで、1つの文字列として組み立てる
  // 例: month=9, day=5, hour=15, minute="26" なら
  //     → "9月5日 15時26分" という文字列が返る
}