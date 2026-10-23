import * as React from "react"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
}: OtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([])

  function setDigit(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1)
    const chars = value.padEnd(length, " ").split("")
    chars[index] = digit || " "
    onChange(chars.join("").trimEnd())
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
    if (!pasted) return
    e.preventDefault()
    onChange(pasted)
    refs.current[Math.min(pasted.length, length) - 1]?.focus()
  }

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          value={value[i] ?? ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Dígito ${i + 1} de ${length}`}
          className={cn(
            "h-12 w-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-medium text-slate-900 outline-none transition-colors focus-visible:border-[#087f9b] focus-visible:bg-white focus-visible:ring-3 focus-visible:ring-[#087f9b]/20 disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      ))}
    </div>
  )
}
