import { useEffect, useState } from 'react'

export default function Visualization({ messageId }) {
  const [chartUrl, setChartUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the chart image
    fetch('http://localhost:8000/download/chart')
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        setChartUrl(url)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load chart:', err)
        setLoading(false)
      })
  }, [messageId])

  if (loading) {
    return <div className="text-sm text-gray-500 mt-4">Loading visualization...</div>
  }

  if (!chartUrl) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-300">
      <h4 className="text-sm font-semibold mb-3 text-gray-900">📊 Visualization</h4>
      <img
        src={chartUrl}
        alt="Analytics chart"
        className="w-full rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  )
}
