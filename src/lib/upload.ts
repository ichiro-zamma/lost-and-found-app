import { writeFile } from 'fs/promises'
// ファイルを書き込むための機能を読み込む
import path from 'path'
// ファイルやフォルダのパスを扱うための機能を読み込む
import crypto from 'crypto'
// ランダムな文字列(UUID)を作るための機能を読み込む

/**
 * アップロードされた画像ファイルを public/uploads に保存し、
 * DBに保存するための相対パス(例: /uploads/xxxx.jpg)を返す。
 * ファイルが無い場合は null を返す。
 */
export async function saveUploadedImage(file: File | null): Promise<string | null> {
    // 画像ファイルを受け取り、保存した画像のパスを返す
  // ファイルが無ければ null を返す
  if (!file || file.size === 0) {
    // fileが存在しない、またはファイルサイズが0の場合
    return null
     // 画像がないので null を返して終了
  }
  

  // ファイル名の重複を避けるため、ランダムな文字列を先頭に付ける
  const ext = path.extname(file.name)
   // 元のファイル名から「拡張子」を取り出す
  // 例：「cat.jpg」→「.jpg」
  const fileName = `${crypto.randomUUID()}${ext}`
  // ランダムなUUID + 拡張子で新しいファイル名を作る
  // 例：「8566a1b8-1e59-4b08-9f5b-ca6ada630c82.jpg」
  const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
  // 実際に画像を保存する場所のパスを作る
  //
  // process.cwd() → 現在のプロジェクトの場所
  // public        → publicフォルダ
  // uploads      → uploadsフォルダ
  // fileName     → 新しく作ったファイル名
  //
  // 例：
  // /app/public/uploads/8566a1b8-....jpg

  const buffer = Buffer.from(await file.arrayBuffer())
   // アップロードされた画像を「バイナリデータ」に変換する　　バイナリデータ＝コンピューターが扱う「0」と「1」のデータ
  //
  // 画像は文字ではなく、コンピューター上では
  // 0と1のようなデータとして扱われる
  await writeFile(filePath, buffer)
  // bufferに入っている画像データを
  // filePathで指定した場所に保存する

  return `/uploads/${fileName}`
  // 保存した画像のURL用パスを返す
  //
  // 例：
  // /uploads/8566a1b8-1e59-4b08-9f5b-ca6ada630c82.jpg
}