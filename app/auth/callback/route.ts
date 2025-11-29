import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createServerSupabaseClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            // TODO: エラーをロギングする。
            console.error('supabaseでエラーが発生しました：', error)
            return NextResponse.redirect(new URL('/auth/login', request.url))
        }
        return NextResponse.redirect(new URL('/chat', request.url))
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
}
