import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint }) {
  const chartRef = useRef(null)
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 900,
      height: 450,
      layout: { background: { color: '#111' }, textColor: '#ddd' },
      grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } }
    })
    chart.addCandlestickSeries()
    return () => chart.remove()
  }, [])

  useEffect(() => {
    const ws = new WebSocket("wss://pumpportal.fun/api/data")
    ws.onopen = () => ws.send(JSON.stringify({ method: 'subscribeTokenTrade', keys: [mint] }))
    ws.onmessage = e => {
      const msg = JSON.parse(e.data)
      if (msg.channel === 'tokenTrade' && msg.data) {
        setTrades(t => [msg.data, ...t].slice(0, 20))
      }
    }
    return () => ws.close()
  }, [mint])

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
        <h2 className="font-semibold mb-4">Dark Nyra Trading</h2>
        <div ref={chartRef} />
      </div>
      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
        <h3 className="font-semibold mb-4 text-sm">Dernières opérations</h3>
        <ul className="text-xs font-mono space-y-1 max-h-[400px] overflow-y-auto">
          {trades.map((t, i) => (
            <li key={i} className={`flex justify-between ${t.side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              <span>{t.side}</span>
              <span>{t.size}</span>
              <span>@ {t.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
