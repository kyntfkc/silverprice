import { useState, useEffect } from 'react'

export interface AppSettings {
  defaultProductGram: number
  defaultDollarRate: number
  defaultLaborDollar: number
  defaultShipping: number
  defaultPackaging: number
  defaultServiceFee: number
  defaultETaxRate: number
  defaultCommission: number
  defaultStandardProfit: number
  defaultExtraCost: number
  defaultPremiumBox: number
  defaultChain45Price: number
  defaultChain60Price: number
  lightBoxMultiplier: number // Işıklı Kutu çarpanı
}

interface SettingsModalProps {
  open: boolean
  initial: AppSettings
  onClose: () => void
  onSave: (settings: AppSettings, applyNow: boolean) => void
}

export default function SettingsModal({ open, initial, onClose, onSave }: SettingsModalProps) {
  const [form, setForm] = useState<AppSettings>(initial)
  const [applyNow, setApplyNow] = useState(true)
  const [draft, setDraft] = useState<Record<keyof AppSettings, string>>({
    defaultProductGram: String(initial.defaultProductGram),
    defaultDollarRate: String(initial.defaultDollarRate),
    defaultLaborDollar: String(initial.defaultLaborDollar),
    defaultShipping: String(initial.defaultShipping),
    defaultPackaging: String(initial.defaultPackaging),
    defaultServiceFee: String(initial.defaultServiceFee),
    defaultETaxRate: String(initial.defaultETaxRate),
    defaultCommission: String(initial.defaultCommission),
    defaultStandardProfit: String(initial.defaultStandardProfit),
    defaultExtraCost: String(initial.defaultExtraCost),
    defaultPremiumBox: String(initial.defaultPremiumBox ?? 300),
    defaultChain45Price: String(initial.defaultChain45Price ?? 10),
    defaultChain60Price: String(initial.defaultChain60Price ?? 30),
    lightBoxMultiplier: String(initial.lightBoxMultiplier ?? 1),
  })

  useEffect(() => {
    setForm(initial)
    setDraft({
      defaultProductGram: String(initial.defaultProductGram),
      defaultDollarRate: String(initial.defaultDollarRate),
      defaultLaborDollar: String(initial.defaultLaborDollar),
      defaultShipping: String(initial.defaultShipping),
      defaultPackaging: String(initial.defaultPackaging),
      defaultServiceFee: String(initial.defaultServiceFee),
      defaultETaxRate: String(initial.defaultETaxRate),
      defaultCommission: String(initial.defaultCommission),
      defaultStandardProfit: String(initial.defaultStandardProfit),
      defaultExtraCost: String(initial.defaultExtraCost),
      defaultChain45Price: String(initial.defaultChain45Price ?? 10),
      defaultChain60Price: String(initial.defaultChain60Price ?? 30),
      lightBoxMultiplier: String(initial.lightBoxMultiplier ?? 1),
    })
  }, [initial])

  if (!open) return null

  const setDraftValue = (key: keyof AppSettings, v: string) => {
    setDraft(prev => ({ ...prev, [key]: v }))
  }
  const commitNumber = (key: keyof AppSettings) => {
    const raw = draft[key]
    const n = parseFloat(raw)
    setForm(prev => ({ ...prev, [key]: isNaN(n) ? 0 : n }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-3">Ayarlar</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">İşçilik (Dolar)</label>
            <input type="text" inputMode="decimal" value={draft.defaultLaborDollar}
              onChange={e=>setDraftValue('defaultLaborDollar', e.target.value)} onBlur={()=>commitNumber('defaultLaborDollar')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Varsayılan Ürün Gram</label>
            <input type="text" inputMode="decimal" value={draft.defaultProductGram}
              onChange={e=>setDraftValue('defaultProductGram', e.target.value)} onBlur={()=>commitNumber('defaultProductGram')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Varsayılan Dolar Kuru (TL)</label>
            <input type="text" inputMode="numeric" value={draft.defaultDollarRate}
              onChange={e=>setDraftValue('defaultDollarRate', e.target.value)} onBlur={()=>commitNumber('defaultDollarRate')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Kargo</label>
            <input type="text" inputMode="numeric" value={draft.defaultShipping}
              onChange={e=>setDraftValue('defaultShipping', e.target.value)} onBlur={()=>commitNumber('defaultShipping')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Ambalaj</label>
            <input type="text" inputMode="numeric" value={draft.defaultPackaging}
              onChange={e=>setDraftValue('defaultPackaging', e.target.value)} onBlur={()=>commitNumber('defaultPackaging')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Işıklı Kutu (varsayılan)</label>
            <input type="text" inputMode="numeric" value={draft.defaultExtraCost}
              onChange={e=>setDraftValue('defaultExtraCost', e.target.value)} onBlur={()=>commitNumber('defaultExtraCost')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Premium Kutu (varsayılan)</label>
            <input type="text" inputMode="numeric" value={draft.defaultPremiumBox}
              onChange={e=>setDraftValue('defaultPremiumBox', e.target.value)} onBlur={()=>commitNumber('defaultPremiumBox')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Hizmet Bedeli</label>
            <input type="text" inputMode="numeric" value={draft.defaultServiceFee}
              onChange={e=>setDraftValue('defaultServiceFee', e.target.value)} onBlur={()=>commitNumber('defaultServiceFee')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">E-ticaret Stopajı (%)</label>
            <input type="text" inputMode="decimal" value={draft.defaultETaxRate}
              onChange={e=>setDraftValue('defaultETaxRate', e.target.value)} onBlur={()=>commitNumber('defaultETaxRate')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Komisyon (%)</label>
            <input type="text" inputMode="decimal" value={draft.defaultCommission}
              onChange={e=>setDraftValue('defaultCommission', e.target.value)} onBlur={()=>commitNumber('defaultCommission')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Standart Kâr Oranı (%)</label>
            <input type="text" inputMode="decimal" value={draft.defaultStandardProfit}
              onChange={e=>setDraftValue('defaultStandardProfit', e.target.value)} onBlur={()=>commitNumber('defaultStandardProfit')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">45 cm Zincir Fiyatı (TL)</label>
            <input type="text" inputMode="numeric" value={draft.defaultChain45Price}
              onChange={e=>setDraftValue('defaultChain45Price', e.target.value)} onBlur={()=>commitNumber('defaultChain45Price')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">60 cm Zincir Fiyatı (TL)</label>
            <input type="text" inputMode="numeric" value={draft.defaultChain60Price}
              onChange={e=>setDraftValue('defaultChain60Price', e.target.value)} onBlur={()=>commitNumber('defaultChain60Price')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1 font-medium">Işıklı Kutu Çarpanı (x)</label>
            <input type="text" inputMode="numeric" value={draft.lightBoxMultiplier}
              onChange={e=>setDraftValue('lightBoxMultiplier', e.target.value)} onBlur={()=>commitNumber('lightBoxMultiplier')}
              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={applyNow} onChange={e=>setApplyNow(e.target.checked)} />
            Kaydet ve mevcut değerlere uygula
          </label>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-lg border border-slate-300">İptal</button>
            <button onClick={()=>onSave(form, applyNow)} className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-md hover:shadow-lg hover:from-slate-600 hover:to-slate-700 transition-all duration-200">Kaydet</button>
          </div>
        </div>
      </div>
    </div>
  )
}
