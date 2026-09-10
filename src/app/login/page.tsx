//ログインページに LoginForm を表示するコード
import { LoginForm } from './LoginForm'
//同じフォルダにあるLoginForm.tsxを読み込む
export default function LoginPage() {
//ログインページを表示するための関数 login にアクセスしたときに、このページが使われる
  return <LoginForm />
  //LoginFormを画面に表示する 
  //LoginForm.tsxに書いた 
  //「メールアドレス・パスワード入力欄」 // 「ログインボタン」 // などが表示される
}