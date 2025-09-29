import React, { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function CoinChart({ geckoId }) {
  const ref = useRef(null)

  useEffect(() => {
    const chart = createChart(ref.current, {
      width: 800,
      height: 450,
      layout: { background: { color: '#111' }, textColor: '#ddd' },
      grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } }
    })
    const series = chart.addLineSeries({ color: '#facc15' }) // doré élégant

    fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=1&interval=minute`)
      .then(r => r.json())
      .then(d => {
        const data = d.prices.map(p => ({ time: Math.floor(p[0] / 1000), value: p[1] }))
        series.setData(data)
      })

    return () => chart.remove()
  }, [geckoId])

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">Évolution du prix</h3>
      <div ref={ref} />
    </div>
  )
}
