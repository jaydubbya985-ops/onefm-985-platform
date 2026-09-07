/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

/** Error / warning stay long enough to read “NOT sent”. Info / success stay brief. */
export function toastHoldMs(type: ToastType): number {
  return type === 'error' || type === 'warning' ? 8000 : 3000
}

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-[#D4A853]" />,
  warning: <Info className="w-4 h-4 text-orange-400" />,
}

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-500/10 border-emerald-500/30',
  error: 'bg-red-500/10 border-red-500/30',
  info: 'bg-[#D4A853]/10 border-[#D4A853]/30',
  warning: 'bg-orange-500/10 border-orange-500/30',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => remove(id), toastHoldMs(type))
  }, [remove])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${styles[t.type]} min-w-[280px]`}
            >
              {icons[t.type]}
              <span className="text-sm text-[#F4F1EA] font-medium flex-1">{t.message}</span>
              <button
                onClick={() => remove(t.id)}
                className="text-[#F4F1EA]/40 hover:text-[#F4F1EA] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastContainer() {
  return null
}
