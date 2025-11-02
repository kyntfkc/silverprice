export interface ProductInfo {
  productGram: number
  laborDollar: number // İşçilik dolar cinsinden
  dollarAmount: number // Toplam dolar tutarı
}

export interface SilverInfo {
  dollarRate: number // Dolar kuru (TL)
  productAmount: number // Ürün Tutarı (TL)
  purchasePrice: number // Alış Fiyatı (TL)
}

export interface Expenses {
  shipping: number
  packaging: number
  eCommerceTax: number
  eCommerceTaxRate: number
  serviceFee: number
  extraChain: number
  specialPackaging: number
}

export interface Platform {
  name: string
  commissionRate: number
  salePrice: number
  targetProfitRate?: number // Standart senaryo için kâr oranı (%)
}

export interface ProfitResult {
  platform: string
  commissionRate: number
  salePrice: number
  commissionAmount: number
  totalExpenses: number
  netProfit: number
  profitRate: number
  bankayaYatan: number
  optimumScore?: number
}

export interface SavedCalculation {
  id: string
  name: string
  createdAt: number
  results: ProfitResult[]
}

