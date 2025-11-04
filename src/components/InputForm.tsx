import { useState, useEffect, useMemo, useCallback } from 'react'
import { ProductInfo, SilverInfo, Expenses, Platform } from '../types'
import { 
  calculateProductAmount, 
  calculatePurchasePrice 
} from '../utils/calculations'
import { Plus, X } from 'lucide-react'

interface InputFormProps {
  productInfo: ProductInfo
  silverInfo: SilverInfo
  expenses: Expenses
  platforms: Platform[]
  onProductInfoChange: (info: ProductInfo) => void
  onSilverInfoChange: (info: SilverInfo) => void
  onExpensesChange: (expenses: Expenses) => void
  onPlatformsChange: (platforms: Platform[]) => void
}

const calculateDefaultSalePrice = (productAmount: number): number => {
  return Math.round(productAmount * 2)
}

function InputForm({
  productInfo,
  silverInfo,
  expenses,
  platforms,
  onProductInfoChange,
  onSilverInfoChange,
  onExpensesChange,
  onPlatformsChange,
}: InputFormProps) {
  const [expandedSections, setExpandedSections] = useState({
    labor: false,
    expenses: false,
    extras: false,
  })
  
  const [productGramInput, setProductGramInput] = useState<string>('')
  const [laborDollarInput, setLaborDollarInput] = useState<string>('')
  const [lengthOption, setLengthOption] = useState<'none' | '45' | '60'>('none')
  const [silverChain45Enabled, setSilverChain45Enabled] = useState(false)

  // Hesaplamalar: Ürün Tutarı = Ürün Gramı × İşçilik × Dolar Kuru
  const productAmount = useMemo(() => calculateProductAmount(
    productInfo.productGram,
    productInfo.laborDollar,
    silverInfo.dollarRate
  ), [productInfo.productGram, productInfo.laborDollar, silverInfo.dollarRate])
  
  const purchasePrice = useMemo(() => calculatePurchasePrice(productAmount), [productAmount])
  
  // Dolar Tutarı (sadece gösterim için): Ürün Gramı × İşçilik
  const dollarAmount = useMemo(() => productInfo.productGram * productInfo.laborDollar, [productInfo.productGram, productInfo.laborDollar])

  // 45 cm Gümüş Zincir fiyatı: dolar kuru x 2
  const silverChain45Price = useMemo(() => silverInfo.dollarRate * 2, [silverInfo.dollarRate])

  // 45 cm Gümüş Zincir fiyatını expenses'e güncelle (sadece seçiliyse)
  useEffect(() => {
    updateExpenses('silverChain45Cost', silverChain45Enabled ? silverChain45Price : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [silverChain45Price, silverChain45Enabled])

  useEffect(() => {
    const updatedProductInfo = {
      ...productInfo,
      dollarAmount: dollarAmount
    }
    if (Math.abs(updatedProductInfo.dollarAmount - productInfo.dollarAmount) > 0.0001) {
      onProductInfoChange(updatedProductInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollarAmount])

  useEffect(() => {
    const updatedSilverInfo = {
      ...silverInfo,
      productAmount: productAmount,
      purchasePrice: purchasePrice
    }
    if (
      Math.abs(updatedSilverInfo.productAmount - silverInfo.productAmount) > 0.01 ||
      Math.abs(updatedSilverInfo.purchasePrice - silverInfo.purchasePrice) > 0.01
    ) {
      onSilverInfoChange(updatedSilverInfo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productAmount, purchasePrice])

  const toggleSection = (section: 'labor' | 'expenses' | 'extras') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateProductInfo = useCallback((field: keyof ProductInfo, value: number | boolean) => {
    onProductInfoChange({ ...productInfo, [field]: value })
  }, [productInfo, onProductInfoChange])

  const updateExpenses = useCallback((field: keyof Expenses, value: number) => {
    onExpensesChange({ ...expenses, [field]: value })
  }, [expenses, onExpensesChange])

  const handleSpecialPackagingToggle = useCallback(() => {
    if (expenses.specialPackaging === 0) {
      try {
        const saved = localStorage.getItem('appSettings')
        if (saved) {
          const parsed = JSON.parse(saved)
          const val = parsed?.defaultExtraCost ?? 150
          updateExpenses('specialPackaging', typeof val === 'number' ? val : 150)
        } else {
          updateExpenses('specialPackaging', 150)
        }
      } catch {
        updateExpenses('specialPackaging', 150)
      }
    } else {
      updateExpenses('specialPackaging', 0)
    }
  }, [expenses.specialPackaging, updateExpenses])

  const handlePremiumBoxToggle = useCallback(() => {
    if (expenses.premiumBox === 0) {
      try {
        const saved = localStorage.getItem('appSettings')
        if (saved) {
          const parsed = JSON.parse(saved)
          const val = parsed?.defaultPremiumBox ?? 300
          updateExpenses('premiumBox', typeof val === 'number' ? val : 300)
        } else {
          updateExpenses('premiumBox', 300)
        }
      } catch {
        updateExpenses('premiumBox', 300)
      }
    } else {
      updateExpenses('premiumBox', 0)
    }
  }, [expenses.premiumBox, updateExpenses])

  const updatePlatform = (index: number, field: keyof Platform, value: string | number) => {
    const updated = [...platforms]
    updated[index] = { ...updated[index], [field]: value }
    onPlatformsChange(updated)
  }

  const addPlatform = () => {
    const scenarioNumbers = platforms
      .map(p => {
        const match = p.name.match(/Senaryo (\d+)/)
        return match ? parseInt(match[1]) : 0
      })
      .filter(n => n > 0)
    
    const nextNumber = scenarioNumbers.length > 0 
      ? Math.max(...scenarioNumbers) + 1 
      : platforms.some(p => p.name === 'Standart') ? 1 : 1
    
    const std = platforms.find(p => p.name === 'Standart')
    const initialSale = std?.salePrice ?? calculateDefaultSalePrice(silverInfo.productAmount)
    onPlatformsChange([
      ...platforms,
      { name: `Senaryo ${nextNumber}`, commissionRate: 22, salePrice: Math.round(initialSale) },
    ])
  }


  const removePlatform = (index: number) => {
    const next = platforms.filter((_, i) => i !== index)
    if (next.length === 0) {
      onPlatformsChange([
        { name: 'Standart', commissionRate: 22, salePrice: calculateDefaultSalePrice(silverInfo.productAmount), targetProfitRate: 30 },
      ])
    } else {
      onPlatformsChange(next)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-sm font-extrabold text-slate-900 mb-1.5 uppercase tracking-wider">Ürün Gram</label>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={productGramInput !== '' ? productGramInput : (productInfo.productGram === 0 ? '' : productInfo.productGram.toFixed(2).replace('.', ','))}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    const normalizedValue = inputValue.replace(',', '.')
                    if (normalizedValue === '' || /^(\d+)?([.,]\d*)?$/.test(normalizedValue)) {
                      setProductGramInput(inputValue)
                      if (lengthOption !== 'none') {
                      setLengthOption('none')
                      updateExpenses('extraChain', 0)
                    }
                      if (normalizedValue === '' || normalizedValue === '.') {
                        updateProductInfo('productGram', 0)
                      } else {
                        const numValue = parseFloat(normalizedValue)
                        if (!isNaN(numValue)) {
                          updateProductInfo('productGram', numValue)
                        }
                      }
                    }
                  }}
                  onBlur={() => setProductGramInput('')}
                  className="w-32 px-3 py-2.5 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 bg-white transition-all font-medium text-slate-900 hover:border-slate-400 shadow-sm"
                  placeholder="0,00"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">Gr</span>
              </div>
              <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem('appSettings')
                  const chain45Price = saved ? (JSON.parse(saved)?.defaultChain45Price ?? 10) : 10
                  
                  const nextOption = lengthOption === '45' ? 'none' : '45'
                  
                  // Ekstra maliyeti expenses'e ekle/çıkar
                  if (nextOption === '45') {
                    updateExpenses('extraChain', chain45Price)
                  } else {
                    updateExpenses('extraChain', 0)
                  }
                  
                  setLengthOption(nextOption)
                } catch {
                  const nextOption = lengthOption === '45' ? 'none' : '45'
                  if (nextOption === '45') {
                    updateExpenses('extraChain', 10)
                  } else {
                    updateExpenses('extraChain', 0)
                  }
                  setLengthOption(nextOption)
                }
              }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${lengthOption === '45' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'}`}
            >
              45 cm Zincir
            </button>
            <button
              type="button"
              onClick={() => {
                try {
                  const saved = localStorage.getItem('appSettings')
                  const chain60Price = saved ? (JSON.parse(saved)?.defaultChain60Price ?? 30) : 30
                  
                  const nextOption = lengthOption === '60' ? 'none' : '60'
                  
                  // Ekstra maliyeti expenses'e ekle/çıkar
                  if (nextOption === '60') {
                    updateExpenses('extraChain', chain60Price)
                  } else {
                    updateExpenses('extraChain', 0)
                  }
                  
                  setLengthOption(nextOption)
                } catch {
                  const nextOption = lengthOption === '60' ? 'none' : '60'
                  if (nextOption === '60') {
                    updateExpenses('extraChain', 30)
                  } else {
                    updateExpenses('extraChain', 0)
                  }
                  setLengthOption(nextOption)
                }
              }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${lengthOption === '60' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'}`}
            >
              60 cm Zincir
            </button>
            <button
              type="button"
              onClick={() => {
                setSilverChain45Enabled(!silverChain45Enabled)
              }}
              className={`px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${silverChain45Enabled ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'}`}
              title={`45 cm Gümüş Zincir: ${Math.round(silverInfo.dollarRate * 2 * 100) / 100} TL`}
            >
              45 cm Gümüş Zincir
            </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-700">Işıklı Kutu</span>
              <input
                type="number"
                step="0.01"
                value={expenses.specialPackaging}
                onChange={(e) => updateExpenses('specialPackaging', parseFloat(e.target.value) || 0)}
                disabled={expenses.specialPackaging === 0}
                className={`w-20 px-2 py-1 text-xs border border-slate-300/70 rounded-md focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-white shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${expenses.specialPackaging === 0 ? 'pointer-events-none opacity-60' : ''}`}
                placeholder="150"
              />
              <span className="text-[11px] text-gray-500">TL</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={expenses.specialPackaging > 0}
                  onChange={handleSpecialPackagingToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
            <div className="flex items-center gap-2 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-700">Premium Kutu</span>
              <input
                type="number"
                step="0.01"
                value={expenses.premiumBox}
                onChange={(e) => updateExpenses('premiumBox', parseFloat(e.target.value) || 0)}
                disabled={expenses.premiumBox === 0}
                className={`w-20 px-2 py-1 text-xs border border-slate-300/70 rounded-md focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-white shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${expenses.premiumBox === 0 ? 'pointer-events-none opacity-60' : ''}`}
                placeholder="300"
              />
              <span className="text-[11px] text-gray-500">TL</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={expenses.premiumBox > 0}
                  onChange={handlePremiumBoxToggle}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden bg-gradient-to-br from-slate-50/80 to-white">
        <button
          onClick={() => toggleSection('expenses')}
          className="w-full h-10 px-3 flex items-center justify-between bg-white/90 hover:bg-white transition-all duration-200 group"
        >
          <span className="font-bold text-slate-900 text-sm">İşçilik ve Masraf Kalemleri</span>
          <Plus className={`w-5 h-5 text-gray-700 transition-transform ${expandedSections.expenses ? 'rotate-45' : ''}`} />
        </button>
        {expandedSections.expenses && (
          <div className="p-3 bg-white border-t border-slate-200/80">
            <div className="mb-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1 font-medium">İşçilik (Dolar)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={laborDollarInput !== '' ? laborDollarInput : (productInfo.laborDollar === 0 ? '' : productInfo.laborDollar.toFixed(2).replace('.', ','))}
                    onChange={(e) => {
                      const inputValue = e.target.value
                      const normalizedValue = inputValue.replace(',', '.')
                      if (normalizedValue === '' || /^(\d+)?([.,]\d*)?$/.test(normalizedValue)) {
                        setLaborDollarInput(inputValue)
                        if (normalizedValue === '' || normalizedValue === '.') {
                          updateProductInfo('laborDollar', 0)
                        } else {
                          const numValue = parseFloat(normalizedValue)
                          if (!isNaN(numValue)) {
                            updateProductInfo('laborDollar', numValue)
                          }
                        }
                      }
                    }}
                    onBlur={() => setLaborDollarInput('')}
                    className="w-full px-2.5 py-2 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white shadow-sm"
                    placeholder="0,00"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">$</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Kargo</label>
                <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={expenses.shipping}
                  onChange={(e) => updateExpenses('shipping', parseFloat(e.target.value) || 0)}
                    className="h-9 w-full px-2 pr-8 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center shadow-sm"
                />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">TL</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Ambalaj</label>
                <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={expenses.packaging}
                  onChange={(e) => updateExpenses('packaging', parseFloat(e.target.value) || 0)}
                    className="h-9 w-full px-2 pr-8 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center shadow-sm"
                />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">TL</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">Hizmet Bedeli</label>
                <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={expenses.serviceFee}
                  onChange={(e) => updateExpenses('serviceFee', parseFloat(e.target.value) || 0)}
                    className="h-9 w-full px-2 pr-8 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center shadow-sm"
                />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">TL</span>
              </div>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">E-ticaret Stopajı (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={expenses.eCommerceTaxRate === 0 ? '' : expenses.eCommerceTaxRate}
                  onChange={(e) => {
                    const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                    updateExpenses('eCommerceTaxRate', value)
                  }}
                  className="h-9 w-full px-2 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center shadow-sm"
                  placeholder="1.00"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Senaryolar</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={addPlatform}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
              title="Yeni senaryo ekle"
            >
              <Plus className="w-3 h-3" />
              Senaryo Ekle
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {platforms.map((platform, index) => (
            <div key={platform.name || `platform-${index}`} className="p-3 bg-white rounded-lg border border-slate-300/70 shadow-sm hover:shadow-md hover:border-slate-400/60 transition-all duration-200 relative ring-1 ring-slate-200/20">
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={platform.name}
                  onChange={(e) => {
                    if (platform.name === 'Standart') return
                    updatePlatform(index, 'name', e.target.value)
                  }}
                  disabled={platform.name === 'Standart'}
                  className="w-full px-2 py-1.5 pr-8 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white font-medium text-slate-900 text-center shadow-sm disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-500"
                  placeholder="Senaryo adı"
                />
                <button
                  onClick={() => removePlatform(index)}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 rounded-full transition-all duration-200 shadow-sm hover:shadow-md group z-10"
                  title="Senaryoyu sil"
                >
                  <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" strokeWidth={3} />
                </button>
              </div>
              {platform.name === 'Standart' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1 font-medium">Komisyon</label>
                    <input
                      type="number"
                      step="0.1"
                      value={platform.commissionRate}
                      onChange={(e) =>
                        updatePlatform(index, 'commissionRate', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1.5 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center font-semibold shadow-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1 font-medium">Kâr Oranı (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={(platform.targetProfitRate ?? 30) === 0 ? '' : (platform.targetProfitRate ?? 30)}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                        updatePlatform(index, 'targetProfitRate', value)
                      }}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center font-semibold shadow-sm"
                      placeholder="30"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-medium">Komisyon</label>
                  <input
                    type="number"
                    step="0.1"
                    value={platform.commissionRate}
                    onChange={(e) =>
                      updatePlatform(index, 'commissionRate', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1.5 text-sm border border-slate-300/70 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center font-semibold shadow-sm"
                    placeholder="0"
                  />
                </div>
              )}
                <div>
                <label className="block text-xs text-slate-600 mb-1 font-medium">
                  Satış Fiyatı
                  {platform.name === 'Standart' && (
                    <span className="ml-1 text-xs text-gray-500 font-normal">(Otomatik)</span>
                  )}
                </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      value={platform.salePrice}
                      onChange={(e) => {
                        if (platform.name === 'Standart') return
                        updatePlatform(index, 'salePrice', parseInt(e.target.value) || 0)
                      }}
                      disabled={platform.name === 'Standart'}
                      className="w-full pr-8 px-2 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-center font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                      placeholder="0"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">TL</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InputForm
