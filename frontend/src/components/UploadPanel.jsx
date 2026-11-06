import { useRef } from 'react'

export default function UploadPanel({ filePreview, isDragging, onFileChange, onDrop, onDragOver, onDragLeave }) {
  const inputRef = useRef(null)

  const handleBrowseClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-6 shadow-soft transition-all duration-300">
      <label className="block text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Upload leaf image</label>
      <div
        className={`file-dropzone mt-4 flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed bg-white/90 px-5 text-center transition ${
          isDragging ? 'border-emerald-500 bg-emerald-50/90' : 'border-emerald-200'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            handleBrowseClick()
          }
        }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-3xl shadow-sm">
          🌿
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-slate-900">Drag & drop or choose a file</p>
          <p className="text-sm text-slate-500">PNG, JPG, or JPEG up to 8MB</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg"
          className="sr-only"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={handleBrowseClick}
          className="mt-1 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Browse image
        </button>
      </div>
      {filePreview && (
        <div className="mt-6 grid gap-3 rounded-3xl border border-emerald-200 bg-white p-4 text-left shadow-sm">
          <span className="text-sm font-semibold text-emerald-700">Preview</span>
          <img src={filePreview} alt="Upload preview" className="h-48 w-full rounded-3xl object-cover" />
        </div>
      )}
    </div>
  )
}
