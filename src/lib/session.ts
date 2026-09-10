//ログインしている人をCookieで覚えておき、あとから誰がログインしているのか確認するためのファイル
//Cookie = ブラウザに保存しておく「小さなメモ」
import { cookies } from 'next/headers'// Next.jsでCookieを読み書きするための機能を読み込む
import crypto from 'crypto'// 署名を作るための暗号化機能を読み込む
import { prisma } from '@/lib/prisma'// DBからログイン中のユーザー情報を取得するためにPrismaを読み込む

const COOKIE_NAME = 'session'
// Cookieに付ける名前を「session」とする 
// この名前でログイン状態を保存・取得する

// userIdに「署名」を付けて、改ざんできない文字列にする
function sign(userId: number): string {
//userIdを受け取って、署名付きの文字列を返す関数
  const secret = process.env.AUTH_SECRET!
  // .envに設定した秘密の文字列を取得する // この秘密の文字列は署名を作るために使用する
  const signature = crypto.createHmac('sha256', secret).update(String(userId)).digest('hex')
  // userIdと秘密鍵を使って署名を作る // sha256という方式でHMAC署名を作成する // digest('hex')で結果を16進数の文字列にする
  return `${userId}.${signature}`
  // 「ユーザーID.署名」という形で返す // 例：8.abcd1234...
}

// 署名付き文字列を検証し、正しければuserIdを取り出す(改ざんされていたらnullを返す)
function verify(value: string): number | null {
 // Cookieに保存されている値を受け取って検証する // 正しければユーザーIDを返す // おかしければnullを返す
  const [userIdRaw, signature] = value.split('.')
  // 「.」で文字列を分割する // 例えば「8.abcd1234」なら、 
  // userIdRaw = "8" // signature = "abcd1234"
  if (!userIdRaw || !signature) return null
  // ユーザーIDまたは署名が存在しなければ不正な値としてnullを返す

  const secret = process.env.AUTH_SECRET!
  // 署名を作るときと同じ秘密の文字列を取得する
  const expected = crypto.createHmac('sha256', secret).update(userIdRaw).digest('hex')
  // Cookieに入っているuserIdを使って // 「本来正しいはずの署名」をもう一度作る

  if (signature !== expected) return null
  // Cookieに入っていた署名と 今作った正しい署名を比較する 
  // 一致しなければCookieが改ざんされた可能性があるためnullを返す

  return Number(userIdRaw)
  // 署名が正しければuserIdを文字列から数値に変換して返す
}

// ログイン処理: Cookieに署名付きのuserIdをセットする
export async function createSession(userId: number) {
    // ログイン成功時に呼び出される関数 // userIdを使ってログイン状態をCookieに保存する
  const cookieStore = await cookies()
  // 現在のCookieを操作するためのものを取得する
  cookieStore.set(COOKIE_NAME, sign(userId), {
    // 「session」という名前のCookieを作成する // 値には署名付きのuserIdを保存する
    httpOnly: true, // ブラウザのJavaScriptから読み取れないようにする(安全性のため)
    secure: process.env.NODE_ENV === 'production',
    // 本番環境ではHTTPS通信の場合のみCookieを送信する // 開発環境ではhttpでも使えるようにする
    sameSite: 'lax',
    // 別サイトから勝手にCookieを送信されにくくするための設定
    path: '/',
    // Webサイト全体でこのCookieを使用できるようにする
    maxAge: 60 * 60 * 24 * 7, // 7日間
    // Cookieの有効期間を設定 // 60秒 × 60分 × 24時間 × 7日 = 7日間
    //Cookieを盗まれた場合などに長期間悪用されるリスクがあるので7日間
  })
}

// ログアウト処理: Cookieを削除する
export async function destroySession() {
    //ログアウトするときに呼び出される関数
  const cookieStore = await cookies()
  // Cookieを操作するためのものを取得する
  cookieStore.delete(COOKIE_NAME)
  //「session」という名前のCookieを削除する //これによってログイン状態を解除する
}

// 現在ログイン中のユーザーを取得する(いなければnull)
export async function getCurrentUser() {
    // 現在ログインしているユーザーの情報を取得する関数
  const cookieStore = await cookies()
    // 現在のCookieを取得する
  const value = cookieStore.get(COOKIE_NAME)?.value
   //「session」という名前のCookieの値を取得する // Cookieが存在しなければundefinedになる
  if (!value) return null
  // Cookieがなければログインしていないのでnullを返す
  //Cookieがないなら、この関数ではnullとして扱おう
  const userId = verify(value)
  // Cookieの署名を検証する // 正しければuserIdが返ってくる // 改ざんされていればnull
  if (userId === null) return null
  // Cookieが不正ならログインしていないものとして扱う
 

  return prisma.user.findUnique({ where: { id: userId } })
  // Cookieから取得したuserIdを使ってDBからユーザーを検索する // 見つかったユーザー情報を返す
}

//createSession(user.id)
// → ログイン状態を作る

// destroySession()
// → ログイン状態を消す

// getCurrentUser()
// → 今ログインしている人を取得する