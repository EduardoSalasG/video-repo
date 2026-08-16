export default function ProgressBar({ lastPositionSeconds }: { lastPositionSeconds: number | null }) {
  if (lastPositionSeconds == null) return null
  const label = `${Math.floor(lastPositionSeconds / 60)}m ${lastPositionSeconds % 60}s`
  return <p className="text-sm">Resume at {label}</p>
}
