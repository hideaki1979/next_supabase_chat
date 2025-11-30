'use client'

import { createClient } from "@/lib/supabase/client";
import { Message, MessageWithProfile, Profile } from "@/types/database"
import { User } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Edit2, LogOut, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Toast from "../components/Toast";

type Props = {
    initialMessages: MessageWithProfile[];
    currentUser: User;
    currentProfile: Profile | null;
}

export default function ChatRoom({ initialMessages, currentUser, currentProfile }: Props) {
    const [messages, setMessages] = useState<MessageWithProfile[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const handleCloseError = useCallback(() => setErrorMessage(null), [])
    const handleCloseMessage = useCallback(() => setSuccessMessage(null), [])
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()

    // リアルタイム購読
    useEffect(() => {
        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    // payload.new には新しいメッセージのデータが含まれている
                    const newMessage = payload.new as Message

                    // プロファイル情報のみを取得
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', newMessage.user_id)
                        .single()

                    if (profile) {
                        const messageWithProfile: MessageWithProfile = {
                            ...newMessage,
                            profiles: profile as Profile
                        }
                        setMessages((current) => [...current, messageWithProfile])
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    // payload.new には更新されたメッセージのデータが含まれている
                    const updatedMessage = payload.new as Message

                    // プロファイル情報のみを取得
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', updatedMessage.user_id)
                        .single()

                    if (profile) {
                        const messageWithProfile: MessageWithProfile = {
                            ...updatedMessage,
                            profiles: profile as Profile
                        }
                        setMessages((current) =>
                            current.map((msg) =>
                                msg.id === messageWithProfile.id ? messageWithProfile : msg
                            )
                        )
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'messages',
                },
                (payload) => {
                    setMessages((current) =>
                        current.filter((msg) => msg.id !== payload.old.id)
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // CREATE: メッセージ送信
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || loading) return

        setLoading(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    content: newMessage.trim(),
                    user_id: currentUser.id,
                })

            if (error) {
                console.error('メッセージの送信に失敗しました：', error)
                setErrorMessage('メッセージの送信に失敗しました')
            } else {
                setSuccessMessage('メッセージの送信に成功しました。')
                setNewMessage('')
            }
        } finally {
            setLoading(false)
        }
    }

    // UPDATE: メッセージ編集
    const handleEditMessage = async (id: string) => {
        if (!editContent.trim() || loading) return

        setLoading(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
            const { error } = await supabase
                .from('messages')
                .update({
                    content: editContent.trim(),
                    is_edited: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (error) {
                console.error('メッセージの編集に失敗しました：', error)
                setErrorMessage('メッセージの編集に失敗しました。もう一度お試しください。')
            } else {
                setEditingId(null)
                setEditContent('')
                setSuccessMessage('メッセージの編集に成功しました。')
            }
        } finally {
            setLoading(false)
        }
    }

    // DELETE: メッセージ削除
    const handleDeleteMessage = async (id: string) => {
        if (!confirm('このメッセージを削除しますか？')) return

        setLoading(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
            const { error } = await supabase.from('messages').delete().eq('id', id)
            if (error) {
                console.error('メッセージの削除に失敗しました：', error)
                setErrorMessage('メッセージの削除に失敗しました。もう一度お試しください。')
            } else {
                setSuccessMessage('メッセージの削除に成功しました。')
            }
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (message: MessageWithProfile) => {
        setEditingId(message.id)
        setEditContent(message.content)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditContent('')
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
        router.refresh()
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* ヘッダー */}
            <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        リアルタイムチャット
                    </h1>
                    <p className="text-gray-600">
                        ようこそ、{currentProfile?.username}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                    <LogOut size={18} />
                    ログアウト
                </button>
            </header>

            {/* エラーメッセージ */}
            <Toast
                message={errorMessage || ''}
                type="error"
                isVisible={!!errorMessage}
                onClose={handleCloseError}
            />

            {/* 成功メッセージ */}
            <Toast
                message={successMessage || ''}
                type="success"
                isVisible={!!successMessage}
                onClose={handleCloseMessage}
            />

            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isOwn = message.user_id === currentUser.id
                    const isEditing = editingId === message.id

                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-sm lg:max-w-md ${isOwn ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800'} rounded-lg shadow p-4 space-y-2`}
                            >
                                {!isOwn && (
                                    <p className="text-xs font-semibold text-gray-600">
                                        {message.profiles.username}
                                    </p>
                                )}

                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={3}
                                            className="w-full p-2 text-sm border rounded text-white"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditMessage(message.id)}
                                                disabled={loading}
                                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                            >
                                                保存
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                            >
                                                キャンセル
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                            {message.content}
                                        </p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`text-xs ${isOwn ? 'text-indigo-200' : 'text-gray-500'}`}>
                                                {formatDistanceToNow(new Date(message.created_at), {
                                                    addSuffix: true,
                                                    locale: ja,
                                                })}
                                                {message.is_edited && '(編集済み)'}
                                            </p>
                                            {isOwn && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => startEdit(message)}
                                                        className="p-1 hover:bg-indigo-500 rounded transition-colors"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMessage(message.id)}
                                                        className="p-1 hover:bg-indigo-500 rounded transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef}></div>
            </div>

            {/* 入力フォーム */}
            <form
                onSubmit={handleSendMessage}
                className="bg-white border-t p-4 flex gap-2"
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Send size={18} />
                    送信
                </button>
            </form>
        </div>
    )
}