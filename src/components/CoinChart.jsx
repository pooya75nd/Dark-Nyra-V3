import React, { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function CoinChart({ geckoId, symbol }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const chart = createChart(ref.current, {
      width: ref.current.clientWidth,
      height: 500,
      layout: { background: { color: '#0e0e23' }, textColor: '#e5e7eb' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
    })
    const lineSeries = chart.addLineSeries({ color: '#4b3eff', lineWidth: 2 })

    fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=1&interval=minute`)
      .then(r => r.json())
      .then(d => {
        const data = d.prices.map(p => ({ time: Math.floor(p[0] / 1000), value: p[1] }))
        lineSeries.setData(data)
      })

    const handleResize = () => {
      chart.applyOptions({ width: ref.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [geckoId])

  return (
    <div className="w-full h-[500px]">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">{symbol} / USD</h3>
      <div ref={ref} className="w-full h-[450px]" />
    </div>
  )
}
