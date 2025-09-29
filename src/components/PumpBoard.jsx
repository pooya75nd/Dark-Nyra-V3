import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function PumpBoard({ projectName, mint }) {
  const chartRef = useRef(null)
  const [trades, setTrades] = useState([])

  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: 800,
      height: 400,
      layout: { background: { color: '#000' }, textColor: '#fff' }
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
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <h2 className="font-semibold mb-2">{projectName} Trading</h2>
        <div ref={chartRef} className="border border-gray-800 rounded" />
      </div>
      <div className="bg-gray-900 p-3 rounded border border-gray-800">
        <h3 className="font-semibold mb-2 text-sm">Dernières opérations</h3>
        <ul className="text-xs space-y-1 max-h-96 overflow-y-auto">
          {trades.map((t, i) => (
            <li key={i} className="flex justify-between">
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
