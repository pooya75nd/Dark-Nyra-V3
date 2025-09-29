import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint, onPriceUpdate }) {
  const chartRef = useRef(null)
  const [trades, setTrades] = useState([])

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

    // Tu pourrais ici ajouter un fetch d’historique (OHLC) pour remplir le graphique
    // candleSeries.setData([...])

    return () => chart.remove()
  }, [])

  useEffect(() => {
    const ws = new WebSocket("wss://pumpportal.fun/api/data")
    ws.onopen = () => {
      ws.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [mint] }))
    }
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.channel === 'tokenTrade' && msg.data) {
        const t = msg.data
        setTrades(prev => [t, ...prev].slice(0, 50))

        // 👉 Envoie la mise à jour du prix vers App.jsx
        if (onPriceUpdate) {
          onPriceUpdate(t.price)
        }
      }
    }
    return () => ws.close()
  }, [mint, onPriceUpdate])

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* CHART */}
      <div className="col-span-2 bg-panel rounded-lg border border-border p-4">
        <div ref={chartRef} />
      </div>

      {/* ORDER FLOW */}
      <div className="bg-panel rounded-lg border border-border p-4">
        <h3 className="font-semibold mb-4 text-sm">Dernières opérations</h3>
        <ul className="text-xs font-mono space-y-2 max-h-[500px] overflow-y-auto">
          {trades.map((t, i) => (
            <li 
              key={i} 
              className={`flex justify-between ${t.side === 'BUY' ? 'text-buy' : 'text-sell'}`}
            >
              <span>{t.side}</span>
              <span>{t.size.toFixed(2)}</span>
              <span>@ {t.price.toFixed(4)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
