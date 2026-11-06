import { useState } from 'react'
import { motion } from 'framer-motion'

const panels = [
  {
    key: 'symptoms',
    title: 'Symptoms observed',
    icon: '⚠️',
    accent: 'from-orange-50 to-orange-100 text-orange-800',
  },
  {
    key: 'solution',
    title: 'Action to take',
    icon: '✅',
    accent: 'from-sky-50 to-sky-100 text-sky-800',
  },
  {
    key: 'advice',
    title: 'Farmer recommendation',
    icon: '🌱',
    accent: 'from-lime-50 to-yellow-100 text-lime-900',
  },
]

export default function ResultSection({ result, previewUrl }) {
  const [openKey, setOpenKey] = useState('symptoms')

  const toggleCard = (key) => {
    setOpenKey((current) => (current === key ? '' : key))
  }

  const getPreviewText = (text, open) => {
    if (open || text.length < 160) return text
    return `${text.slice(0, 160).trim()}...`
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-soft"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Result summary</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Detected outcome</h2>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
          {result.status}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Disease detected</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{result.prediction}</p>
              </div>
              <div className="inline-flex items-center rounded-full bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-800">
                🌾 {result.confidence}%
              </div>
            </div>
            <div className="mt-5 rounded-full bg-slate-200/70 px-1.5 py-1">
              <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(result.confidence, 100)}%` }} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Uploaded image</p>
            <img src={previewUrl} alt="Uploaded leaf" className="mt-4 h-56 w-full rounded-[24px] object-cover" />
          </div>
        </div>

        <div className="space-y-4">
          {panels.map((panel) => {
            const isOpen = openKey === panel.key
            const text = result[panel.key]

            return (
              <motion.div
                key={panel.key}
                whileHover={{ y: -4 }}
                className={`rounded-[26px] border border-slate-200 bg-gradient-to-br ${panel.accent} p-5 shadow-sm`}
              >
                <button
                  type="button"
                  onClick={() => toggleCard(panel.key)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{panel.icon}</span>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">{panel.title}</p>
                        <p className="mt-2 text-sm font-medium text-slate-900">{isOpen ? 'Tap to collapse' : 'Tap to expand'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{isOpen ? '−' : '+'}</span>
                  </div>
                </button>
                <div className="mt-4 text-sm leading-7 text-slate-800">
                  {getPreviewText(text, isOpen)}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
