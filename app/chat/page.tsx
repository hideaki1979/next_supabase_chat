import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatRoom from "./ChatRoom";

export default async function ChatPage() {
    const supabase = await createServerSupabaseClient()

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()


    if (!user || userError) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: messages } = await supabase
        .from('messages')
        .select(`
        *,
        profiles (*)
        `)
        .order('created_at', { ascending: true })
        .limit(30)

    return (
        <ChatRoom
            initialMessages={messages || []}
            currentUser={user}
            currentProfile={profile}
        />
    )
}