type ItemForScoring = {
  categoryId: number
  colorId: number
  locationId: number
  locationDetail: string | null
}

const DATE_PROXIMITY_DAYS = 3 // 日時が「近い」とみなす許容日数
const MIN_DETAIL_LENGTH = 3   // 場所の詳細で部分一致を判定する際の最低文字数

/**
 * 落とし物と拾得物の一致度スコアを計算する
 * 内訳: 種類+30 / 色+20 / 場所(大枠)+15 / 場所(詳細・部分一致)+15 / 日時が近い+20
 */
export function calculateMatchScore(
  lostItem: ItemForScoring & { lostAt: Date },
  foundItem: ItemForScoring & { foundAt: Date }
): number {
  let score = 0

  // 種類の完全一致
  if (lostItem.categoryId === foundItem.categoryId) score += 30

  // 色の完全一致
  if (lostItem.colorId === foundItem.colorId) score += 20

  // 場所(大枠)の完全一致
  if (lostItem.locationId === foundItem.locationId) score += 15

  // 場所(詳細)の部分一致(曖昧検索)。短すぎる文字列同士の偶然の一致は除外する
  if (
    lostItem.locationDetail &&
    foundItem.locationDetail &&
    lostItem.locationDetail.length >= MIN_DETAIL_LENGTH &&
    foundItem.locationDetail.length >= MIN_DETAIL_LENGTH &&
    (lostItem.locationDetail.includes(foundItem.locationDetail) ||
      foundItem.locationDetail.includes(lostItem.locationDetail))
  ) {
    score += 15
  }

  // 日時が近いか(±3日以内)
  const diffMs = Math.abs(lostItem.lostAt.getTime() - foundItem.foundAt.getTime())
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  if (diffDays <= DATE_PROXIMITY_DAYS) score += 20

  return score
}