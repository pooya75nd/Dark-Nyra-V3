import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint }) {
  const chartRef = useRef(null)
  const [trades, setTrades] = useState([])
  const [price, setPrice] = useState(null)

  // Initialiser le graphique
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 500,
      layout: { background: { color: '#111' }, textColor: '#ddd' },
      grid: { vertLines: { color: '#1f1f1f' }, horzLines: { color: '#1f1f1f' } },
      crosshair: { mode: 1 },
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#4ade80',
      wickDownColor: '#ef4444',
    })

    // Exemple : tu peux brancher ton flux historique ici si dispo
    // candleSeries.setData([...])

    return () => chart.remove()
  }, [])

  // WebSocket Pump.fun pour récupérer les trades
  useEffect(() => {
    const ws = new WebSocket("wss://pumpportal.fun/api/data")
    ws.onopen = () => {
      ws.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [mint] }))
    }
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.channel === 'tokenTrade' && msg.data) {
        const t = msg.data
        setTrades((prev) => [t, ...prev].slice(0, 50))
        setPrice(t.price) // met à jour le prix en direct
      }
    }
    return () => ws.close()
  }, [mint])

  return (
    <div>
      {/* HEADER STYLE WhiteLiquid */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Dark Nyra / USDC</h2>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-400">Price</span>
            <div className="font-semibold">{price ? `$${price}` : '—'}</div>
          </div>
          <div>
            <span className="text-gray-400">24h Change</span>
            <div className={price && price % 2 === 0 ? "text-green-400" : "text-red-400"}>
              {/* Placeholder, tu peux calculer avec historique */}
              +2.34%
            </div>
          </div>
          <div>
            <span className="text-gray-400">Volume</span>
            <div>123.4K</div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-3 gap-6">
        {/* CHART */}
        <div className="col-span-2 bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
          <div ref={chartRef} />
        </div>

        {/* ORDER FLOW */}
        <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
          <h3 className="font-semibold mb-4 text-sm">Dernières opérations</h3>
          <ul className="text-xs font-mono space-y-2 max-h-[500px] overflow-y-auto">
            {trades.map((t, i) => (
              <li 
                key={i} 
                className={`flex justify-between ${t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}
              >
                <span>{t.side}</span>
                <span>{t.size.toFixed(2)}</span>
                <span>@ {t.price.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
