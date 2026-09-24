'use client'

interface Props {
  show: boolean
  label: string
  /** Positioning key rendered as data-bar attribute (e.g. "cut" | "exp") */
  bar: string
  min: number
  max: number
  step: number
  value: number
  onChange(v: number): void
  onOff(): void
}

export default function RangeBar({ show, label, bar, min, max, step, value, onChange, onOff }: Props) {
  if (!show) return null
  return (
    <div className={'bio-bar' + (show ? ' on' : '')} data-bar={bar} role="group" aria-label={label}>
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        aria-label={label + ' amount'}
      />
      <span className="bio-bar-val">{value.toFixed(2)}</span>
      <button type="button" onClick={onOff} title="Turn off" aria-label={'Turn off ' + label}>✕</button>
    </div>
  )
}
