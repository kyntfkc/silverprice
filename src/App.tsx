 
import ProfitCalculator from './components/ProfitCalculator'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 py-5 px-5">
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-5">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 shadow-xl shadow-teal-500/25 ring-4 ring-teal-500/5">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="M7 14l4-4 3 3 6-6"/>
              <path d="M20 7h-4V3"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-teal-600 to-cyan-700 tracking-tight">Gümüş Hesap</h1>
          </div>
        </div>
        <ProfitCalculator />
      </div>
    </div>
  )
}

export default App

