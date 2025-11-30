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
    <div>
      <div>
        <h1>リアルタイムチャット</h1>
        <p>supabase + Next.js学習用チャットアプリ</p>

        <div>
          <div>
            <h2>実装機能</h2>
            <ul>
              <li>✅ メール/Google認証</li>
              <li>✅ リアルタイムメッセージ</li>
              <li>✅ CRUD操作（作成・編集・削除）</li>
              <li>✅ Row Level Security</li>
            </ul>
          </div>

          <div>
            <Link
              href="/auth/login"
            >
              ログイン
            </Link>
            <Link
              href="/auth/signup"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}