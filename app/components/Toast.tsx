'use client'

import { CheckCircle2, X, XCircle } from "lucide-react";
import { useEffect } from "react";

type ToastType = 'success' | 'error'

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    if (!isVisible) return null

    const toastConfig = {
        success: {
            bgColor: 'bg-green-50 border-green-500',
            textColor: 'text-green-700',
            Icon: CheckCircle2,
        },
        error: {
            bgColor: 'bg-red-50 border-red-500',
            textColor: 'text-red-700',
            Icon: XCircle,
        }
    }

    const { bgColor, textColor, Icon } = toastConfig[type]

    return (
        <div className={`${bgColor} border-l-4 ${textColor} p-4 m-4 rounded`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5`} />
                    <p>{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`hover:opacity-70 ml-4 transition-opacity`}
                    aria-label="閉じる"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}