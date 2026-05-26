import { ArrowRight } from 'lucide-react'

const EXAMPLE_QUERIES = [
  "Show total loan disbursed by product",
   "Show top 5 cities with highest loan disbursement.",

    "What is the total POS (Principal Outstanding) by state?",
    "Show loan distribution by product_type.",
  "Top 10 high value loans",
  "Loan distribution by state",
  "Show overdue loans (DPD > 30)",
]

export default function WelcomeScreen({ onSelectQuery }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      {/* Logo */}
      <div className="mb-8">
        <img 
          src="/images/iris-logo.png" 
          alt="IRIS Logo" 
          className="h-32 object-contain"
        />
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white text-center mb-4">
        SULB Insights AI
      </h1>

      {/* Subtitle */}
      <p className="text-2xl text-gray-700 dark:text-gray-300 text-center mb-8">
        Smart Insights. Better Decisions.
      </p>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-12 leading-relaxed">
        Leverage AI-driven insights to query and analyze LAP, MSME, and other lending datasets in real time.
      </p>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mb-12">
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-sky-600 dark:text-sky-400 mb-2">📊 Portfolio Insights</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Analyze 34,000+ loan records across products and regions.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-sky-600 dark:text-sky-400 mb-2">📥 Export Data</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Download reports as Excel instantly.
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold text-sky-600 dark:text-sky-400 mb-2">📈 Visual Analytics</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Auto-generated charts for trends and distributions.
          </p>
        </div>
      </div>

      {/* Example Queries */}
      <div className="max-w-3xl w-full">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-3">Try these questions:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {EXAMPLE_QUERIES.map((query, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuery(query)}
              className="text-left p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-gray-750 transition-all group shadow-sm cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 font-medium">{query}</span>
                <ArrowRight size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-sky-600 dark:group-hover:text-sky-400" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
