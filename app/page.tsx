import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-white to-blue-500 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* メインカード */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-white/20">
          {/* ヘッダーセクション */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <span className="text-3xl">💬</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-indigo-500 to-blue-700 bg-clip-text text-transparent mb-4">
              リアルタイムチャット
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              supabase + Next.js学習用チャットアプリ
            </p>
          </div>
          {/* 機能リストセクション */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              実装機能
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "メール/Google認証",
                "リアルタイムメッセージ",
                "CRUD操作（作成・編集・削除）",
                "Row Level Security"
              ].map((feature) => (
                <div key={feature}
                  className="flex items-center gap-3 p-4 rounded-xl bg-linear-to-r from-indigo-100 to-blue-50 border border-indigo-200 hover:shadow-lg transition-all duration-300 hover:scale-110"
                >
                  <div className="shrink-0 w-6 h-6 bg-linear-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-800 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          {/* ボタンセクション */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/login"
              className="flex-1 px-6 py-4 bg-linear-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center hover:from-indigo-600 hover:to-blue-700"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 px-6 py-4 bg-white text-indigo-600 font-semibold rounded-xl border-2 border-indigo-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center hover:bg-blue-50"
            >
              新規登録
            </Link>
          </div>

          {/* 装飾的な要素 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🚀 モダンな技術スタックで構築されたリアルタイムチャットアプリケーション
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}