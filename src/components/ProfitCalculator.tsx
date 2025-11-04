import { useState, useEffect, useCallback, useRef } from 'react'
import { ProductInfo, SilverInfo, Expenses, Platform, ProfitResult } from '../types'
import { calculateAllPlatforms, calculateStandardSalePrice } from '../utils/calculations'
// Backend API devre dışı - sadece local hesaplama
import { TrendingUp, Loader2, Settings } from 'lucide-react'
import SilverRateCard from './SilverRateCard'
import Toast from './Toast'
import InputForm from './InputForm'
import ResultsTable from './ResultsTable'
import SettingsModal, { AppSettings } from './SettingsModal'

const defaultProductInfo: ProductInfo = {
  productGram: 2.20,
  laborDollar: 3.00,
  dollarAmount: 6.60, // Ürün Gramı × İşçilik = 2.20 × 3.00
}

const defaultSilverInfo: SilverInfo = {
  dollarRate: 42.00,
  productAmount: 138.60, // Ürün Gramı × İşçilik × Dolar Kuru = 2.20 × 1.50 × 42
  purchasePrice: 138.60, // Alış Fiyatı = Ürün Tutarı
}

const defaultExpenses: Expenses = {
  shipping: 120,
  packaging: 20,
  eCommerceTax: 0,
  eCommerceTaxRate: 1.00,
  serviceFee: 12,
  extraChain: 5,
  specialPackaging: 0,
  premiumBox: 0,
  silverChain45Cost: 84, // Dolar kuru x 2 = 42 x 2
}

const getDefaultPlatforms = (productAmount: number = 138.60): Platform[] => [
  { name: 'Standart', commissionRate: 22, salePrice: Math.round(productAmount * 2), targetProfitRate: 30 },
]

function ProfitCalculator() {
  const defaultAppSettings: AppSettings = {
    defaultProductGram: 2.20,
    defaultDollarRate: 42.00,
    defaultLaborDollar: 3.00,
    defaultShipping: 120,
    defaultPackaging: 20,
    defaultServiceFee: 12,
    defaultETaxRate: 1.0,
    defaultCommission: 22,
    defaultStandardProfit: 30,
    defaultExtraCost: 150,
    defaultPremiumBox: 300,
    defaultChain45Price: 10,
    defaultChain60Price: 30,
    lightBoxMultiplier: 2, // Işıklı Kutu varsayılan çarpanı
  }

  const [showSettings, setShowSettings] = useState(false)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...defaultAppSettings, ...parsed }
      } catch {
        return defaultAppSettings
      }
    }
    return defaultAppSettings
  })
  const [productInfo, setProductInfo] = useState<ProductInfo>(() => {
    const saved = localStorage.getItem('productInfo')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Eski format kontrolü - yeni alanları ekle
        return {
          productGram: parsed.productGram ?? defaultProductInfo.productGram,
          laborDollar: parsed.laborDollar ?? (parsed.laborMillem ? 1.50 : defaultProductInfo.laborDollar),
          dollarAmount: parsed.dollarAmount ?? defaultProductInfo.dollarAmount,
        }
      } catch {
        return defaultProductInfo
      }
    }
    return defaultProductInfo
  })
  const [silverInfo, setSilverInfo] = useState<SilverInfo>(() => {
    const saved = localStorage.getItem('silverInfo')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Eski format kontrolü - yeni alanları ekle
        return {
          dollarRate: parsed.dollarRate ?? (parsed.silverPrice ? 42.00 : defaultSilverInfo.dollarRate),
          productAmount: parsed.productAmount ?? defaultSilverInfo.productAmount,
          purchasePrice: parsed.purchasePrice ?? defaultSilverInfo.purchasePrice,
        }
      } catch {
        return defaultSilverInfo
      }
    }
    return defaultSilverInfo
  })
  const [expenses, setExpenses] = useState<Expenses>(() => {
    try {
      const saved = localStorage.getItem('expenses')
      return saved ? JSON.parse(saved) : defaultExpenses
    } catch {
      return defaultExpenses
    }
  })
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    try {
      const saved = localStorage.getItem('platforms')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.length === 0 || !parsed.some((p: Platform) => p.name === 'Standart')) {
          try {
            const savedSilverInfo = localStorage.getItem('silverInfo')
            const productAmount = savedSilverInfo ? JSON.parse(savedSilverInfo).productAmount : defaultSilverInfo.productAmount
            return getDefaultPlatforms(productAmount)
          } catch {
            return getDefaultPlatforms(defaultSilverInfo.productAmount)
          }
        }
        return parsed
      }
      return getDefaultPlatforms(defaultSilverInfo.productAmount)
    } catch {
      return getDefaultPlatforms(defaultSilverInfo.productAmount)
    }
  })
  const [results, setResults] = useState<ProfitResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)
  const [toast, setToast] = useState<{message: string; type?: 'success' | 'error' | 'info'} | null>(null)
  const [showExtraCols, setShowExtraCols] = useState(false)

  // localStorage'a debounce ile yazma (performans için)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('productInfo', JSON.stringify(productInfo))
      } catch (e) {
        console.error('localStorage write error:', e)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [productInfo])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('silverInfo', JSON.stringify(silverInfo))
      } catch (e) {
        console.error('localStorage write error:', e)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [silverInfo])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('expenses', JSON.stringify(expenses))
      } catch (e) {
        console.error('localStorage write error:', e)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [expenses])

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('platforms', JSON.stringify(platforms))
      } catch (e) {
        console.error('localStorage write error:', e)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [platforms])

  // Backend sync kaldırıldı - sadece localStorage kullanılıyor

  const applySettingsToState = (s: AppSettings) => {
    setProductInfo(prev => ({ ...prev, productGram: s.defaultProductGram, laborDollar: s.defaultLaborDollar }))
    setSilverInfo(prev => ({ ...prev, dollarRate: s.defaultDollarRate }))
    setExpenses(prev => ({ ...prev, shipping: s.defaultShipping, packaging: s.defaultPackaging, serviceFee: s.defaultServiceFee, eCommerceTaxRate: s.defaultETaxRate, specialPackaging: prev.specialPackaging > 0 ? s.defaultExtraCost : 0, premiumBox: prev.premiumBox > 0 ? s.defaultPremiumBox : 0 }))
    setPlatforms(prev => prev.map(p => {
      if (p.name === 'Standart') return { ...p, commissionRate: s.defaultCommission, targetProfitRate: s.defaultStandardProfit }
      return p
    }))
  }

  const handleSaveSettings = (s: AppSettings, applyNow: boolean) => {
    setAppSettings(s)
    localStorage.setItem('appSettings', JSON.stringify(s))
    if (applyNow) applySettingsToState(s)
    setShowSettings(false)
  }

  const didApplySettingsOnMountRef = useRef(false)
  useEffect(() => {
    if (didApplySettingsOnMountRef.current) return
    didApplySettingsOnMountRef.current = true
    try {
      const saved = localStorage.getItem('appSettings')
      const s = saved ? { ...defaultAppSettings, ...JSON.parse(saved) } : appSettings
      applySettingsToState(s)
    } catch {
      applySettingsToState(appSettings)
    }
  }, [])

  // Standart senaryonun fiyatını otomatik hesapla
  const prevDepsRef = useRef<string>('')
  useEffect(() => {
    const depsKey = `${productInfo.productGram}-${productInfo.laborDollar}-${silverInfo.dollarRate}-${expenses.shipping}-${expenses.packaging}-${expenses.serviceFee}-${expenses.extraChain}-${expenses.specialPackaging}-${expenses.eCommerceTaxRate}-${expenses.silverChain45Cost}`
    
    if (prevDepsRef.current === depsKey) return
    prevDepsRef.current = depsKey
    
    setPlatforms(prevPlatforms => {
      let updated: Platform[] | null = null
      const autoNames = ['Standart']
      autoNames.forEach(name => {
        const idx = prevPlatforms.findIndex(p => p.name === name)
        if (idx !== -1) {
          const platform = prevPlatforms[idx]
          const commissionRate = platform.commissionRate || 22
          const defaultTarget = 30
          const targetProfitRate = platform.targetProfitRate ?? defaultTarget
          const newSalePrice = calculateStandardSalePrice(
            productInfo,
            silverInfo,
            expenses,
            commissionRate,
            targetProfitRate,
            appSettings.lightBoxMultiplier
          )
          if (Math.abs(platform.salePrice - newSalePrice) > 0.01) {
            if (!updated) updated = [...prevPlatforms]
            updated[idx] = { ...updated[idx], salePrice: newSalePrice }
          }
        }
      })
      return updated ?? prevPlatforms
    })
  }, [productInfo, silverInfo, expenses])
  
  // Kar oranı değiştiğinde otomatik fiyat güncelleme
  const prevProfitRatesRef = useRef<string>('')
  useEffect(() => {
    const currentProfitRates = platforms
      .filter(p => p.name === 'Standart')
      .map(p => `${p.name}:${p.commissionRate}:${p.targetProfitRate ?? 30}`)
      .join('|')
    
    if (prevProfitRatesRef.current === currentProfitRates) return
    prevProfitRatesRef.current = currentProfitRates
    
    setPlatforms(prevPlatforms => {
      let updated: Platform[] | null = null
      const autoNames = ['Standart']
      autoNames.forEach(name => {
        const idx = prevPlatforms.findIndex(p => p.name === name)
        if (idx !== -1) {
          const platform = prevPlatforms[idx]
          const commissionRate = platform.commissionRate || 22
          const defaultTarget = 30
          const targetProfitRate = platform.targetProfitRate ?? defaultTarget
          const newSalePrice = calculateStandardSalePrice(
            productInfo,
            silverInfo,
            expenses,
            commissionRate,
            targetProfitRate,
            appSettings.lightBoxMultiplier
          )
          if (Math.abs(platform.salePrice - newSalePrice) > 0.01) {
            if (!updated) updated = [...prevPlatforms]
            updated[idx] = { ...updated[idx], salePrice: newSalePrice }
          }
        }
      })
      return updated ?? prevPlatforms
    })
  }, [platforms, productInfo, silverInfo, expenses])

  useEffect(() => {
    if (!hasCalculated) return
    setIsCalculating(true)
    const timer = setTimeout(() => {
      const calculatedResults = calculateAllPlatforms(
        productInfo,
        silverInfo,
        expenses,
        platforms,
        appSettings.lightBoxMultiplier
      )
      setResults(calculatedResults)
      setIsCalculating(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [hasCalculated, productInfo, silverInfo, expenses, platforms])

  const handleCalculate = useCallback(() => {
    setIsCalculating(true)
    setTimeout(() => {
      const calculatedResults = calculateAllPlatforms(productInfo, silverInfo, expenses, platforms)
      setResults(calculatedResults)
      setIsCalculating(false)
      setHasCalculated(true)
    }, 100)
  }, [productInfo, silverInfo, expenses, platforms])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleCalculate()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleCalculate])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 px-3 sm:px-0 pb-24">
      <div className="order-1 md:hidden">
        <div className="card p-3 sm:p-4">
          <SilverRateCard silverInfo={silverInfo} onSilverInfoChange={setSilverInfo} />
        </div>
      </div>

      <div className="order-2 md:order-1 card p-4 sm:p-6 hover:shadow-2xl hover:shadow-rose-300/10 transition-all duration-300">
        <InputForm
          productInfo={productInfo}
          silverInfo={silverInfo}
          expenses={expenses}
          platforms={platforms}
          onProductInfoChange={setProductInfo}
          onSilverInfoChange={setSilverInfo}
          onExpensesChange={setExpenses}
          onPlatformsChange={setPlatforms}
        />
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full mt-6 btn-primary !h-11 text-white !text-sm"
        >
          {isCalculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Hesaplanıyor...
            </>
          ) : (
            <>
          <TrendingUp className="w-4 h-4" />
          Hesapla
            </>
          )}
        </button>
      </div>

      <div className="order-3 md:order-2 space-y-3">
        <div className="card p-3 sm:p-4 hidden md:block">
          <SilverRateCard silverInfo={silverInfo} onSilverInfoChange={setSilverInfo} />
        </div>

        <div className="card p-4 sm:p-6 overflow-y-auto overflow-x-hidden hover:shadow-2xl hover:shadow-rose-300/10 transition-all duration-300">
        {isCalculating ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mb-4" />
            <p className="text-sm text-slate-600 font-medium">Hesaplanıyor...</p>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="mb-3 sm:mb-5 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Hesaplama Sonuçları</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExtraCols(v=>!v)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  title="Komisyon, Bankaya Yatan ve Alış Tutarı sütunlarını göster/gizle"
                >{showExtraCols ? 'Detayı Gizle' : 'Detayı Göster'}</button>
              </div>
            </div>
            
          <ResultsTable results={results} showCommission={showExtraCols} showBank={showExtraCols} showPurchasePrice={showExtraCols} />
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Sonuçları görmek için hesapla butonuna tıklayın</p>
            <p className="text-xs text-slate-400 mt-1">Girdiğiniz bilgilere göre karşılaştırma yapılacak</p>
          </div>
        )}
      </div>
      </div>
      <SettingsModal open={showSettings} initial={appSettings} onClose={()=>setShowSettings(false)} onSave={handleSaveSettings} />

      <button
        onClick={()=>setShowSettings(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 inline-flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl text-sm font-semibold text-white shadow-2xl shadow-rose-500/30 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:via-rose-700 hover:to-pink-700 ring-4 ring-rose-500/10 hover:scale-105 transition-all"
        title="Ayarlar"
      >
        <Settings className="w-4 h-4 text-white" /> <span className="hidden sm:inline">Ayarlar</span>
      </button>
      {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}

export default ProfitCalculator
