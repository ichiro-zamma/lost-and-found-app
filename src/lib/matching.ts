//マッチング機能
type ItemForScoring = {
  categoryId: number
  colorId: number
  locationId: number
  locationDetail: string | null
}
// 「スコア計算に必要な項目だけを持つ型」を、自分で新しく定義している
// 落とし物(LostItem)にも拾得物(FoundItem)にも、共通してこの4項目がある
// この関数は「落とし物か拾得物か」を区別せず、
// 「categoryId, colorId, locationId, locationDetail を持っているもの」なら
// 何でも受け取れるようにするための、共通の型
// locationDetail が string | null なのは、DB上でも任意項目(NULL許容)だったため


const DATE_PROXIMITY_DAYS = 3 // 日時が「近い」とみなす許容日数
// 「日時が近い」と判定する許容日数を、定数として1箇所にまとめている
// こうしておくことで、後で「やっぱり5日以内にしたい」となった時、この1行を直すだけで済む


const MIN_DETAIL_LENGTH = 3   // 場所の詳細で部分一致を判定する際の最低文字数
// 場所の詳細(自由記述)の部分一致判定で使う、最低文字数の基準
// 「1文字でもヒットしてしまう」問題を防ぐために追加した定数


/**
 * 落とし物と拾得物の一致度スコアを計算する
 * 内訳: 種類+30 / 色+20 / 場所(大枠)+15 / 場所(詳細・部分一致)+15 / 日時が近い+20
 */

// /** */ で囲まれたコメントは「JSDoc」と呼ばれる書き方
// エディタ上でこの関数にカーソルを合わせると、この説明が表示される(補足のドキュメント)

export function calculateMatchScore(
  lostItem: ItemForScoring & { lostAt: Date },
  // 第1引数: 落とし物のデータ
  // ItemForScoring & { lostAt: Date }
  // "&" は「交差型」という書き方。「ItemForScoringの4項目」+「lostAtというDate型の項目」
  // の、両方を兼ね備えたデータ、という意味
  foundItem: ItemForScoring & { foundAt: Date }
  // 第2引数: 拾得物のデータ。同様に「共通4項目」+「foundAt」を持つデータ
): number {
  // この関数は、最終的に数値(スコア)を返す、という宣言
  let score = 0
  // スコアを計算していくための変数。0点からスタートし、条件を満たすたびに加算していく
  // const ではなく let なのは、後から値を書き換える(加算する)ため

  // 種類の完全一致
  if (lostItem.categoryId === foundItem.categoryId) score += 30
  // 落とし物と拾得物の categoryId が完全に同じ数値なら、30点加算

  // 色の完全一致
  if (lostItem.colorId === foundItem.colorId) score += 20
  // 同様に colorId が一致すれば20点加算

  // 場所(大枠)の完全一致
  if (lostItem.locationId === foundItem.locationId) score += 15
  // 同様に locationId が一致すれば15点加算

  // 場所(詳細)の部分一致(曖昧検索)。短すぎる文字列同士の偶然の一致は除外する
  if (
    lostItem.locationDetail &&
    // locationDetailが存在する(null でも空文字でもない)場合のみ、この先の判定に進む
    // (&&は「かつ」の意味。1つでもfalseならif全体がfalseになる)
    foundItem.locationDetail &&
    // 拾得物側にもlocationDetailが存在すること
    lostItem.locationDetail.length >= MIN_DETAIL_LENGTH &&
    // 落とし物側の文字数が3文字以上であること
    foundItem.locationDetail.length >= MIN_DETAIL_LENGTH &&
    // 拾得物側の文字数も3文字以上であること
    (lostItem.locationDetail.includes(foundItem.locationDetail) ||
      foundItem.locationDetail.includes(lostItem.locationDetail))
      // どちらかの文字列が、もう片方の文字列に含まれているかどうか
    // ( )で囲んでいるのは、"||"(または)の判定をひとまとめにするため
    // 例: 落とし物"渋谷駅の改札口" / 拾得物"改札口" なら、
    //     "渋谷駅の改札口".includes("改札口") が true になり、この行全体がtrueになる

    //includes()は何をするメソッドか
    // 「ある文字列の中に、指定した文字列が含まれているかどうか」を、true/falseで返すメソッドです。
  ) {
    score += 15
    // 上記の全条件を満たした場合のみ、15点加算
  }

  // 日時が近いか(±3日以内)
  const diffMs = Math.abs(lostItem.lostAt.getTime() - foundItem.foundAt.getTime())
  // getTime(): 日時を「ミリ秒単位の数値」に変換する(1970年1月1日からの経過時間)
  // 2つの日時をこの数値同士で引き算すると、その差(ミリ秒)が求まる
  // Math.abs(): 絶対値を取る(マイナスの値になっても、プラスに変換する)
  // → どちらが先の日時でも、「差の大きさ」だけを求めるため

  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  // ミリ秒を「日数」に変換する計算
  // 1000ミリ秒=1秒、×60=1分、×60=1時間、×24=1日
  // ミリ秒の差を、この「1日あたりのミリ秒数」で割ることで、日数に変換できる

  if (diffDays <= DATE_PROXIMITY_DAYS) score += 20
    // 日数の差が3日以内(DATE_PROXIMITY_DAYS)であれば、20点加算
  
    return score
    // 最終的に積み上がったスコアの合計を返す
}