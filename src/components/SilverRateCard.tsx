import { useState } from 'react'
import { SilverInfo } from '../types'

interface Props {
  silverInfo: SilverInfo
  onSilverInfoChange: (s: SilverInfo) => void
}

export default function SilverRateCard({ silverInfo, onSilverInfoChange }: Props) {
  const [rateInput, setRateInput] = useState('')

  const update = (field: keyof SilverInfo, value: number) => onSilverInfoChange({ ...silverInfo, [field]: value })

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Dolar Kuru</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs text-slate-600 mb-1 font-medium">Dolar Kuru (TL)</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={rateInput !== '' ? rateInput : (silverInfo.dollarRate === 0 || !silverInfo.dollarRate ? '' : silverInfo.dollarRate.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}
              onChange={(e) => {
                const raw = e.target.value
                const cleaned = raw.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
                setRateInput(raw)
                const num = parseFloat(cleaned)
                update('dollarRate', isNaN(num) ? 0 : Math.max(0, num))
              }}
              onBlur={() => setRateInput('')}
              className="w-full px-3 py-2 text-sm border border-slate-300/70 rounded-xl focus:ring-2 focus:ring-zinc-500/40 focus:border-zinc-500 bg-white transition-all font-medium text-slate-900 hover:border-slate-400 shadow-sm"
              placeholder="0,00"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">TL</span>
          </div>
        </div>
      </div>
    </div>
  )
}
