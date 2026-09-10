//DBから施設一覧を取って、登録フォームに渡すコード
//表示する前にDBから施設一覧を取得して、それをフォームに渡している
import { prisma } from '@/lib/prisma'
// Prismaを使ってDBを操作するために読み込む
import { RegisterForm } from './RegisterForm'
//同じフォルダにあるRegisterForm.tsxを読み込む // 実際の入力フォームはこのコンポーネントに任せる

export default async function RegisterPage() {
 //会員登録ページを表示する関数 // asyncなのでDBからデータを取得できる
  const facilities = await prisma.facility.findMany({ orderBy: { id: 'asc' } })
  //DBのfacilityテーブルから施設を全部取得する 
  // findMany()→ 複数のデータを取得 /
  //orderBy: { id: 'asc' }→ idの小さい順に並べる 
  return <RegisterForm facilities={facilities} />
  //RegisterFormを表示する 
  //facilities={facilities}　→ 取得した施設一覧をRegisterFormに渡している
  // RegisterForm側では、function RegisterForm({ facilities }: Props)として受け取る
}

//この2ファイルに分けた理由は、「DBから施設を取得する処理」と「ブラウザ上のフォーム操作」を分けるため
//page.tsx = DBからデータを取る担当 ページを表示する担当
//RegisterForm.tsx = 画面を操作する担当 ページの中のフォーム・操作を担当

// page.tsx
// DBから施設一覧を取得する
//         ↓
// RegisterFormに渡す

// RegisterForm.tsx
// フォームを表示する
//         ↓
// パスワード表示/非表示
// 管理者コード入力
// ボタン操作
//         ↓
// registerを実行