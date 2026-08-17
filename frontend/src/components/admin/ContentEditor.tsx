'use client'

export default function ContentEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-64 w-full rounded-lg border border-ink/15 bg-surface-raised p-3 font-mono text-sm"
        placeholder="Write markdown…"
        aria-label="Content"
      />
      <div className="h-64 overflow-auto rounded-lg border border-ink/10 bg-surface-raised p-3">
        <pre className="whitespace-pre-wrap font-sans">{value || 'Preview'}</pre>
      </div>
    </div>
  )
}
