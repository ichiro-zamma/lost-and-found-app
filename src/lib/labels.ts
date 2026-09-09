//ItemStatusのenum値(UNMATCHEDなど、英単語のコード)を、
// 画面に表示するための日本語の文字に変換するための「対応表(辞書)」を作っている部分
export const STATUS_LABEL: Record<string, string> = {
    // enumの値(英単語)を、日本語の表示名に変換するための対応表
    // Record<string, string> = 「キーも値も文字列であるオブジェクト」という型
  UNMATCHED: '未マッチング',
  CONFIRMING: '確認中',
  RETURNED: '返却済み',
}