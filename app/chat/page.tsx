import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatRoom from "./ChatRoom";

export default async function ChatPage() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()


    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: messages, error } = await supabase
        .from('messages')
        .select(`
        *,
        profiles (*)
        `)
        .order('created_at', { ascending: true })

    // デバッグ用ログ
    console.log('Fetched messages:', messages)
    console.log('Messages error:', error)
    console.log('User ID:', user.id)


    return (
        <ChatRoom
            initialMessages={messages || []}
            currentUser={user}
            currentProfile={profile}
        />
    )
}