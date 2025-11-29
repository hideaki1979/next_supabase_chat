import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 重要: createServerClientとsupabase.auth.getUser()の間に
    // ロジックを書かないでください。単純なミスがユーザーが
    // ランダムにログアウトする問題のデバッグを非常に困難にします。

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 認証が必要なページへの未認証アクセスをリダイレクト
    // （オプション: 必要に応じてカスタマイズ）
    if (!user &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname !== '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
    }

    // 重要: supabaseResponseオブジェクトをそのまま返す必要があります
    // 新しいレスポンスオブジェクトを作成する場合は、必ず：
    // 1. リクエストを渡す: const myNewResponse = NextResponse.next({ request })
    // 2. cookieをコピー: myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. cookieを変更しないように注意
    // これを行わないと、ブラウザとサーバーが同期しなくなり、
    // ユーザーのセッションが早期に終了する可能性があります
    return supabaseResponse;
}
