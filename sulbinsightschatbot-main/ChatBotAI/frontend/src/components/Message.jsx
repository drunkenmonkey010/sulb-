import { Download, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import ChartRenderer from './ChartRenderer'

export default function Message({ message,setInput  }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const handleFollowUp = (question) => {
  // setInput(question); // ✅ updates real input
};

  const handleDownloadExcel = async () => {
    try {
      if (message.download_url) {
        const response = await fetch(`http://localhost:8000${message.download_url}`)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `loan_analytics_${new Date().getTime()}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Failed to download file: ' + error.message)
    }
  }

  return (
    <div className={`message-enter flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-3xl rounded-lg p-4 ${
          message.type === 'user'
            ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-br-none border border-sky-400 shadow-md'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-700 shadow-sm'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm leading-relaxed mb-3">{message.content}</p>

        {/* Chart Rendering */}
        {message.chart && message.type === 'ai' && (
          <ChartRenderer chartData={message.chart} />
        )}

        {/* Table Display */}
        {message.table && message.table.length > 0 && message.type === 'ai' && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">📋 Data</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {Object.keys(message.table[0] || {}).map(key => (
                    <th key={key} className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-left font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.table.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="border border-gray-300 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300">
                        {typeof val === 'number' ? val.toLocaleString() : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {message.table.length > 100 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Showing 5 of {message.table.length} rows</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {message.type === 'ai' && (
          <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {message.download_url && (
              <button
                onClick={handleDownloadExcel}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors border border-gray-300 dark:border-gray-600"
              >
                <Download size={14} />
                Download Excel
              </button>
            )}
          </div>
        )}
        {/* Related Questions */}
    {message.related_questions && message.related_questions.length > 0 && message.type === 'ai' && (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          🤖 Follow-up Questions
        </h4>

        <div className="flex flex-col gap-2">
          {message.related_questions.map((q, index) => (
            <div
              key={index}
              onClick={() => handleFollowUp(q)}
              className="text-left text-xs px-3 py-2 rounded-md 
                        bg-gray-100 dark:bg-gray-700 
                        hover:bg-sky-100 dark:hover:bg-sky-900 
                        text-gray-700 dark:text-gray-300 
                        border border-gray-200 dark:border-gray-600 
                        transition-colors"
            >
              {q}
            </div>
          ))}
        </div>
      </div>
    )}

        {/* Timestamp */}
        <p className={`text-xs mt-2 text-gray-500`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
