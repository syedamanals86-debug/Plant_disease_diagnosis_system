import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import UploadPanel from './components/UploadPanel'
import ResultSection from './components/ResultSection'
import ToastList from './components/ToastList'

const languages = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ur', label: 'Urdu' },
]

const toastDefaults = {
  success: { title: 'Success', emoji: '✅' },
  error: { title: 'Oops', emoji: '⚠️' },
  info: { title: 'Heads up', emoji: '💡' },
}

function makeToast(type, message) {
  const base = toastDefaults[type] || toastDefaults.info
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return { id, emoji: base.emoji, title: base.title, message }
}

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [language, setLanguage] = useState('en')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id))
      }, 3800)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  const handleFilePicked = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
      setDragging(false)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null)
    }
    setDragging(false)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const notify = (type, message) => {
    setToasts((current) => [...current, makeToast(type, message)])
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      notify('error', 'Please upload a leaf image before detection.')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const form = new FormData()
      form.append('file', selectedFile)
      form.append('language', language)

      const response = await axios.post('/api/predict', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (response.data) {
        setResult(response.data)
        notify('success', 'Diagnosis complete. Scroll to review the recommendation cards.')
      }
    } catch (error) {
      console.error(error)
      notify('error', 'Unable to detect disease. Try another image or refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const uploadedBadge = useMemo(() => {
    if (!selectedFile) return 'No file selected'
    return selectedFile.name
  }, [selectedFile])

  return (
    <div className="min-h-screen pb-12">
      <ToastList toasts={toasts} />
      <div className="mx-auto max-w-screen-xl px-6 py-8 lg:px-10">
        <header className="mb-8 rounded-[32px] bg-white/90 px-6 py-6 shadow-soft ring-1 ring-slate-200 backdrop-blur-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-emerald-700">🌾 Smart farm assistant</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Plant Disease Diagnosis</h1>
            </div>
            <div className="hidden rounded-3xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-900 shadow-sm sm:block">
              <span className="mr-2">🍅</span> Modern. Friendly. Presentation-ready.
            </div>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"
        >
          <section className="rounded-[32px] bg-white/95 p-8 shadow-soft ring-1 ring-slate-200">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Upload and detect</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Add your leaf image and choose language</h2>
              </div>
              <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                <span className="mr-1">🧪</span> Ready for fast diagnosis
              </div>
            </div>

            <div className="grid gap-6">
              <UploadPanel
                filePreview={previewUrl}
                isDragging={dragging}
                onFileChange={handleFilePicked}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              />

              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <label htmlFor="language" className="mb-3 block text-sm font-semibold text-slate-700">Choose language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900 shadow-sm transition focus:border-emerald-400"
                  >
                    {languages.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex h-full items-center justify-center rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Detecting...' : 'Detect Disease'}
                </button>
              </div>

              <div className="grid gap-3 rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-5 text-sm text-slate-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-white px-3 py-2 text-xl shadow-sm">🌱</span>
                  <div>
                    <p className="font-semibold text-slate-900">Selected file</p>
                    <p className="mt-1 text-slate-600">{uploadedBadge}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm">Compact layout</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm">Smooth animations</span>
                  <span className="rounded-full bg-white px-3 py-2 shadow-sm">Farmer-friendly</span>
                </div>
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {result ? (
              <ResultSection result={result} previewUrl={previewUrl} />
            ) : (
              <motion.section
                key="empty-state"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.3 }}
                className="rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-soft"
              >
                <div className="flex h-full flex-col justify-center gap-6 text-slate-700">
                  <div className="flex items-center gap-4 rounded-3xl bg-emerald-50 p-5 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">🍅</div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Ready for results</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-900">Upload an image to reveal disease insights.</h3>
                    </div>
                  </div>
                  <div className="grid gap-4 text-sm leading-7 text-slate-600 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">Use clear leaf photos with good light.</div>
                    <div className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">Results include confidence, symptoms, and recommendations.</div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
