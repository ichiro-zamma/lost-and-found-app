//as stringは文字列だと型を指定するだけで、実際に文字列かどうかは確認していないため、
// typeofで実際の値を確認する関数に変更しました。
export function getStringField(formData: FormData, key: string): string {
    // フォームから必須の文字列を取得する関数
  const value = formData.get(key)
   // 指定した名前(key)の入力値を取得する
  if (typeof value !== 'string') {
    // 取得した値が文字列ではない場合
    throw new Error(`${key} は文字列である必要があります`)
     // エラーを発生させる
  }
  return value
}

// 任意項目(空でもよい)用。formに存在しない場合は空文字を返す
export function getOptionalStringField(formData: FormData, key: string): string {
     // フォームから任意の文字列を取得する関数
  const value = formData.get(key)
  // 指定した名前(key)の入力値を取得する
  if (typeof value !== 'string') {
     // 取得した値が文字列ではない場合
    return ''
    // エラーにはせず、空文字を返す
  }
  return value
}