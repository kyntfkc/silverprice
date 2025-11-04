import { memo } from 'react'
import { ProfitResult } from '../types'
import { formatNumber } from '../utils/format'

interface ResultsTableProps {
  results: ProfitResult[]
  showCommission?: boolean
  showBank?: boolean
  showPurchasePrice?: boolean
}

function ResultsTableImpl({ results, showCommission = false, showBank = false, showPurchasePrice = false }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full min-w-[720px] sm:min-w-0 table-fixed">
        <thead>
            <tr className="border-b-2 border-slate-200/80 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20">
            <th className="px-2 py-2 text-left text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Senaryo
            </th>
            {showPurchasePrice && (
              <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                Alış Tutarı
              </th>
            )}
            {showCommission && (
              <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                Komisyon
              </th>
            )}
            <th className="px-2 py-2 text-left text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Satış Tutarı
            </th>
            <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Kâr %
            </th>
            <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Optimum Skor
            </th>
            <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
              Net Kazanç
            </th>
            {showBank && (
              <th className="px-2 py-2 text-center text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                Bankaya Yatan
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((result, index) => {
            const nameLc = result.platform.toLowerCase()
            const isCampaign = nameLc.includes('kampanya') || nameLc.includes('kampanyalı') || nameLc.includes('promosyon')
            const optimumScore = result.optimumScore ?? 0
            
            // Altın uygulaması renk şemasına göre optimum skor renklendirmesi
            let profitBgColor = 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-md shadow-green-300/30'
            let scoreTextColor = 'text-green-700'
            let scoreLabel = 'İyi'
            
            if (isCampaign) {
              profitBgColor = 'bg-gradient-to-r from-slate-400 to-slate-600 shadow-md shadow-slate-300/30'
              scoreTextColor = 'text-slate-600'
              scoreLabel = 'Değişken'
            } else if (optimumScore >= 100) {
              profitBgColor = 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-md shadow-green-300/30'
              scoreTextColor = 'text-green-700'
              scoreLabel = 'Mükemmel'
            } else if (optimumScore >= 80) {
              profitBgColor = 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md shadow-yellow-300/30'
              scoreTextColor = 'text-yellow-700'
              scoreLabel = 'İyi'
            } else if (optimumScore >= 60) {
              profitBgColor = 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-md shadow-orange-300/30'
              scoreTextColor = 'text-orange-700'
              scoreLabel = 'Orta'
            } else if (optimumScore >= 40) {
              profitBgColor = 'bg-gradient-to-r from-red-400 to-red-500 shadow-md shadow-red-300/30'
              scoreTextColor = 'text-red-700'
              scoreLabel = 'Zayıf'
            } else {
              profitBgColor = 'bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-400/30'
              scoreTextColor = 'text-red-800'
              scoreLabel = 'Çok Zayıf'
            }

            const commissionDisplay = result.commissionAmount === 0 
              ? `${Math.round(result.commissionRate)}%`
              : `${formatNumber(result.commissionAmount)} TL`

            return (
              <tr key={`${result.platform}-${index}`} className="hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-blue-50/30 transition-all duration-200 border-b border-slate-100/80 group">
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {result.platform}
                  </span>
                </td>
                {showPurchasePrice && (
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">
                      {formatNumber(result.purchasePrice ?? 0)} TL
                    </span>
                  </td>
                )}
                {showCommission && (
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      {commissionDisplay}
                    </span>
                  </td>
                )}
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {formatNumber(result.salePrice)} <span className="text-slate-500 font-medium">TL</span>
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {Math.round(result.profitRate)}%
                  </span>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  {result.optimumScore !== undefined ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-sm sm:text-base font-bold ${scoreTextColor}`}>
                        {Math.round(result.optimumScore)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {scoreLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <span className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg ${profitBgColor} text-slate-800 font-bold text-xs sm:text-sm hover:scale-105 transition-transform`}>
                    {formatNumber(result.netProfit)} TL
                  </span>
                </td>
                {showBank && (
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">
                      {formatNumber(result.bankayaYatan)} TL
                    </span>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
const ResultsTable = memo(ResultsTableImpl)
export default ResultsTable

