//ユーザー登録・ログイン・ログアウトと、
// それに必要なパスワード・ログイン状態の管理を行うファイル
'use server'
// このファイルの処理をサーバー側で実行することをNext.jsに伝える
import bcrypt from 'bcryptjs'
// パスワードのハッシュ化・照合をするためのbcryptjsを読み込む
import { prisma } from '@/lib/prisma'
// データベースを操作するためのPrismaを読み込む
import { redirect } from 'next/navigation'
// 処理が終わった後に別のページへ移動するためのredirectを読み込む
import { createSession, destroySession } from '@/lib/session'
// ログイン状態を作成・削除するための関数を読み込む
import { Prisma } from '@/generated/prisma/client'
// Prismaが発生させるエラーを判定するために読み込む

export type RegisterState = { error?: string } | undefined
// 会員登録処理の結果の型  errorがあればエラーメッセージを入れる  エラーがなければundefined

export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
    // 会員登録を行うServer Action 
    // prevState：前回の処理結果 
    // formData：フォームから送られてきた入力内容 
    // Promise<RegisterState>：最終的にRegisterStateを返す
  const name = formData.get('name') as string
  // フォームの「name」という項目から名前を取得する
  const email = formData.get('email') as string
  // フォームの「email」という項目からメールアドレスを取得する
  const password = formData.get('password') as string
  // フォームの「password」という項目からパスワードを取得する
  const adminCode = formData.get('adminCode') as string
  // フォームの「adminCode」という項目から管理者コードを取得する
  const facilityIdRaw = formData.get('facilityId') as string
  // フォームの「facilityId」という項目から施設IDを取得する 
  // この時点では文字列として取得される

  // 管理者コードが「何か入力されている」かどうかを先に判定
  const hasAdminCodeInput = adminCode.length > 0

  // 何か入力されているのに、正しいコードと一致しない場合はエラー
  if (hasAdminCodeInput && adminCode !== process.env.ADMIN_CODE) {
    return { error: '管理者コードが正しくありません' }
  }

  const isAdmin = adminCode && adminCode === process.env.ADMIN_CODE
  // 入力された管理者コードと、環境変数に設定された管理者コードを比較する 
  // 一致すれば管理者として扱う
  const role = isAdmin ? 'ADMIN' : 'USER'
  // isAdminがtrueならADMIN 
  // falseならUSER 　 ユーザーの権限を決定する

  // 管理者の場合、施設が選択されているか確認する
  if (isAdmin && !facilityIdRaw) {
    return { error: '管理者登録には所属施設の選択が必要です' }
  }
  // 「管理者なのに施設が選択されていない」場合はエラーを返す 
  // && は「かつ」! は「～ではない」という意味

 const passwordHash = await bcrypt.hash(password, 10)
  // 入力されたパスワードをハッシュ化する 
  // 10はハッシュ計算のコスト（ソルトラウンド）を指定している
  // 計算を意図的に重くすることで、パスワードの総当たり攻撃をされにくくする

  try {
    // DBへの登録処理でエラーが起きる可能性があるためtryで囲む
    await prisma.user.create({
        // Prismaを使ってusersテーブルに新しいユーザーを登録する
      data: {
        name,// 入力された名前を保存する
        email,// 入力されたメールアドレスを保存する
        password: passwordHash,// ハッシュ化したパスワードを保存する
        role, // ADMINまたはUSERを保存する
        facilityId: isAdmin ? Number(facilityIdRaw) : null,
        // 管理者なら選択した施設IDを保存 
        // 一般ユーザーなら施設を持たないのでnullを保存 
        // Number()で施設IDを文字列から数値に変換す
      },
    })
  } catch (err) {
    // DBへの登録中にエラーが発生した場合にここへ来る
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // Prismaが発生させた既知のエラーで、 
        // エラーコードがP2002の場合か確認する 
        // P2002は一意制約違反などで発生する 
        // 今回は同じメールアドレスが登録されている場合など
      return { error: 'このメールアドレスは既に使用されています' }
      // ユーザーにエラーメッセージを返す
    }
    throw err
    // 想定していないエラーなら、そのままエラーを発生させる
  }

  redirect('/login')
  // ユーザー登録が成功したらログイン画面へ移動する
}

export type LoginState = { error?: string } | undefined
// ログイン処理の結果の型 
// エラーがあればerrorにメッセージを入れる

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
// ログインを行うServer Action 
// フォームからメールアドレスとパスワードを受け取る
  const email = formData.get('email') as string
  // フォームからメールアドレスを取得する
  const password = formData.get('password') as string
  // フォームからパスワードを取得する

  const user = await prisma.user.findUnique({ where: { email } })
  // DBから入力されたメールアドレスと一致するユーザーを1人探す

  if (!user) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }
  // ユーザーが見つからなかった場合はエラーを返す

  const isValid = await bcrypt.compare(password, user.password)
  // 入力されたパスワードと 
  // DBに保存されているハッシュ化されたパスワードを照合する 
  // 一致すればtrue、違えばfalse
  if (!isValid) {
    return { error: 'メールアドレスまたはパスワードが正しくありません' }
  }
  // パスワードが一致しなければエラーを返す

  await createSession(user.id)
  // ログインに成功したユーザーのSessionを作成する 
  // 「このユーザーは現在ログイン中」という状態を保存する

  redirect('/')
  // ログイン成功後、トップページへ移動する
}

export async function logout() {
  // ログアウトを行うServer Action
  await destroySession()
  // 現在のログインSessionを削除する 
  // これによってログイン状態を解除する
  redirect('/login')
  // ログアウト後、ログイン画面へ移動する
}