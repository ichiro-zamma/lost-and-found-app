//アプリ全体の共通レイアウトのファイル
import type { Metadata } from "next";// ページのタイトルなどの型を読み込む
import { Geist, Geist_Mono } from "next/font/google";// Google FontsのGeistフォントを読み込む
import "./globals.css";// アプリ全体で使うCSSを読み込む
import { Header } from "@/components/Header";// 自作した共通ヘッダーを読み込む

const geistSans = Geist({// 通常の文字に使うフォントを設定
  variable: "--font-geist-sans",// CSSから使える名前を設定
  subsets: ["latin"],// ラテン文字用のフォントを使用
});

const geistMono = Geist_Mono({ // 等幅フォントを設定
  variable: "--font-geist-mono",// CSSから使える名前を設定
  subsets: ["latin"],// ラテン文字用のフォントを使用
});

export const metadata: Metadata = {// ページの基本情報を設定
  title: "落とし物管理アプリ",// ブラウザのタブに表示されるタイトル
  description: "落とし物と拾得物をマッチングするアプリ",// ページの説明
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja" // ページの言語を日本語にする
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
       // 読み込んだフォントを適用
      // h-full = 高さを画面いっぱいにする
      // antialiased = 文字をなめらかに表示する
    >
      <body className="min-h-full flex flex-col">
        {/* body全体を縦方向のレイアウトにする */}
        <Header />
          {/* 共通ヘッダーを表示する */}
        {/* ここに「管理者用」「ログアウト」などを表示する */}
        <main className="flex-1">
           {/* ページのメイン部分 */}
          {/* flex-1 = ヘッダー以外の残りの高さを使う */}
          {children}
          {/* 現在アクセスしているページの中身をここに表示する */}
          </main>
      </body>
    </html>
  );
}