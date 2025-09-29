import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint, onPriceUpdate }) {
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const [trades, setTrades] = useState([])

  // Initialisation graphique
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
    candleSeriesRef.current = candleSeries

    // Fetch OHLC Pump.fun (remplace resolution par 1m, 5m, 1h selon ton besoin)
    fetch(`https://pumpportal.fun/api/candles?mint=${mint}&resolution=1m`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }))
          candleSeries.setData(formatted)
        }
      })

    return () => chart.remove()
  }, [mint])

  // WebSocket Pump.fun pour flux temps réel
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

        // Met à jour le header
        if (onPriceUpdate) {
          onPriceUpdate(t.price)
        }

        // Met à jour la dernière bougie
        if (candleSeriesRef.current) {
          const lastBar = {
            time: Math.floor(Date.now() / 1000),
            open: t.price,
            high: t.price,
            low: t.price,
            close: t.price,
          }
          candleSeriesRef.current.update(lastBar)
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
