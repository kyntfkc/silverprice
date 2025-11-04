import { ProductInfo, SilverInfo, Expenses, Platform, ProfitResult } from '../types'

// Ürün Tutarı hesaplama: Ürün Gramı × İşçilik (USD) × Dolar Kuru
export function calculateProductAmount(
  productGram: number,
  laborDollar: number,
  dollarRate: number
): number {
  return productGram * laborDollar * dollarRate
}

// Alış Fiyatı hesaplama: Ürün Tutarı (aynı mantık)
export function calculatePurchasePrice(
  productAmount: number
): number {
  return productAmount
}

export function calculateProfit(
  productInfo: ProductInfo,
  silverInfo: SilverInfo,
  expenses: Expenses,
  platform: Platform,
  lightBoxMultiplier: number = 2
): ProfitResult {
  // Ürün Tutarı hesapla: Ürün Gramı × İşçilik × Dolar Kuru
  const productAmount = calculateProductAmount(
    productInfo.productGram,
    productInfo.laborDollar,
    silverInfo.dollarRate
  )
  
  // Dolar Tutarı hesapla (sadece gösterim için)
  const dollarAmount = productInfo.productGram * productInfo.laborDollar
  
  // Alış Fiyatı hesapla
  const purchasePrice = calculatePurchasePrice(productAmount)
  
  // Komisyon Tutarı: Satış Tutarı × Komisyon Oranı / 100
  const commissionAmount = (platform.salePrice * platform.commissionRate) / 100
  
  // E-ticaret Stopajı: Satış Tutarı × (eCommerceTaxRate / 100)
  const eCommerceTaxRate = expenses.eCommerceTaxRate || 1.00
  const eCommerceTaxAmount = platform.salePrice * (eCommerceTaxRate / 100)
  
  // Masraf Toplamı: Kargo + Ambalaj + Stopaj + Hizmet + Ekstra Zincir + Işıklı Kutu (x2) + 45 cm Gümüş Zincir
  const totalExpenses = 
    expenses.shipping +
    expenses.packaging +
    eCommerceTaxAmount +
    expenses.serviceFee +
    expenses.extraChain +
    (expenses.specialPackaging * lightBoxMultiplier) + // Işıklı Kutu
    expenses.silverChain45Cost
  
  // Toplam Maliyet: Alış Fiyatı + Masraf Toplamı + Komisyon Tutarı
  const totalCost = purchasePrice + totalExpenses + commissionAmount
  
  // Kazanç: Satış Tutarı - Toplam Maliyet
  const netProfit = platform.salePrice - totalCost
  
  // Kâr %: (Kazanç ÷ Satış Tutarı) × 100
  const profitRate = platform.salePrice > 0 ? (netProfit / platform.salePrice) * 100 : 0

  // Bankaya yatan: Satış Tutarı - (Komisyon + Kargo + Stopaj)
  const bankayaYatan = platform.salePrice - (commissionAmount + expenses.shipping + eCommerceTaxAmount)

  // Optimum Skor Hesaplama
  const standardSalePrice = calculateStandardSalePrice(
    productInfo,
    silverInfo,
    expenses,
    platform.commissionRate,
    30,
    lightBoxMultiplier
  )
  const salePriceCoefficient = (standardSalePrice > 0 && platform.salePrice > 0) ? platform.salePrice / standardSalePrice : 1
  const optimumScore = standardSalePrice > 0 ? (profitRate / 30) * salePriceCoefficient * 100 : 0

  return {
    platform: platform.name,
    commissionRate: platform.commissionRate,
    salePrice: platform.salePrice,
    commissionAmount,
    totalExpenses,
    netProfit,
    profitRate,
    bankayaYatan,
    optimumScore,
    purchasePrice
  }
}

export function calculateAllPlatforms(
  productInfo: ProductInfo,
  silverInfo: SilverInfo,
  expenses: Expenses,
  platforms: Platform[],
  lightBoxMultiplier: number = 2
): ProfitResult[] {
  const sortedPlatforms = [...platforms].sort((a, b) => {
    if (a.name === 'Standart') return -1
    if (b.name === 'Standart') return 1
    
    const getScenarioNumber = (name: string): number => {
      const match = name.match(/Senaryo (\d+)/)
      return match ? parseInt(match[1]) : Infinity
    }
    
    const numA = getScenarioNumber(a.name)
    const numB = getScenarioNumber(b.name)
    
    if (numA !== Infinity && numB !== Infinity) {
      return numA - numB
    }
    
    return a.name.localeCompare(b.name)
  })
  
  return sortedPlatforms.map(platform => 
    calculateProfit(productInfo, silverInfo, expenses, platform, lightBoxMultiplier)
  )
}

// Standart senaryo için satış fiyatını hesapla
export function calculateStandardSalePrice(
  productInfo: ProductInfo,
  silverInfo: SilverInfo,
  expenses: Expenses,
  commissionRate: number = 22,
  targetProfitRate: number = 30,
  lightBoxMultiplier: number = 2
): number {
  const productAmount = calculateProductAmount(
    productInfo.productGram,
    productInfo.laborDollar,
    silverInfo.dollarRate
  )
  const purchasePrice = calculatePurchasePrice(productAmount)
  
  const fixedExpenses = 
    expenses.shipping +
    expenses.packaging +
    expenses.serviceFee +
    expenses.extraChain +
    (expenses.specialPackaging * lightBoxMultiplier) + // Işıklı Kutu
    expenses.silverChain45Cost
  
  const eCommerceTaxRate = expenses.eCommerceTaxRate || 1.00
  const denominator = 1 - (eCommerceTaxRate / 100) - (commissionRate / 100) - (targetProfitRate / 100)
  
  if (denominator <= 0) {
    return productAmount * 2
  }
  
  const calculatedSalePrice = (purchasePrice + fixedExpenses) / denominator
  return Math.ceil(calculatedSalePrice)
}
