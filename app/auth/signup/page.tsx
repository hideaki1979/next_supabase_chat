'use client'

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                    },
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(error.message)
            } else {
                setMessage('確認メールを送信しました。メールをご確認ください')

                // 1.5秒後にログイン画面へ遷移
                setTimeout(() => {
                    router.push('/auth/login')
                }, 1500)
            }
        } catch (err) {
            setMessage(`サインアップ中にエラーが発生しました： ${err}`)
        } finally {
            setLoading(false)
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        アカウント作成
                    </h2>
                </div>
                <form onSubmit={handleSignup} className="mt-8 space-y-8">
                    {error && (
                        <div>
                            <p>{error}</p>
                        </div>
                    )}
                    {message && (
                        <div>
                            <p>{message}</p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                ユーザー名
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required
                                placeholder="ユーザー名"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                autoComplete="email"
                                required
                                placeholder="メールアドレス"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">パスワード</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                placeholder="パスワード（8文字以上）"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? '作成中...' : '新規登録'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-400">
                            既にアカウント登録済の方（ログイン）
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
