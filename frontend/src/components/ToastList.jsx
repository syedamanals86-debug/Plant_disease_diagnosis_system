import { AnimatePresence, motion } from 'framer-motion'

export default function ToastList({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto mb-3 w-full max-w-xl rounded-3xl border border-emerald-200 bg-white/95 px-5 py-4 shadow-soft ring-1 ring-slate-200"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">{toast.emoji}</span>
              <div>
                <p className="font-semibold text-slate-900">{toast.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
