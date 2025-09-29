import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint, onPriceUpdate }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const [trades, setTrades] = useState([])
  const [timeframe, setTimeframe] = useState('1m')

  async function fetchOHLC(tf) {
    try {
      const res = await fetch(`https://pumpportal.fun/api/candles?mint=${mint}&resolution=${tf}`)
      const data = await res.json()
      if (Array.isArray(data) && candleSeriesRef.current) {
        const formatted = data.map(c => ({
          time: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
        candleSeriesRef.current.setData(formatted)
      }
    } catch (err) {
      console.error('Erreur OHLC', err)
    }
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: { background: { color: '#0e0e23' }, textColor: '#e5e7eb' },
      grid: { vertLines: { color: '#1f2937' }, horzLines: { color: '#1f2937' } },
      crosshair: { mode: 1 },
    })
    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22d3ee', // BUY Kraken style
      downColor: '#f43f5e', // SELL Kraken style
      borderVisible: false,
      wickUpColor: '#22d3ee',
      wickDownColor: '#f43f5e',
    })
    candleSeriesRef.current = candleSeries

    fetchOHLC(timeframe)

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [mint])

  useEffect(() => {
    if (candleSeriesRef.current) {
      fetchOHLC(timeframe)
    }
  }, [timeframe])

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

        if (onPriceUpdate) {
          onPriceUpdate(t.price)
        }

        if (candleSeriesRef.current) {
          candleSeriesRef.current.update({
            time: Math.floor(Date.now() / 1000),
            open: t.price,
            high: t.price,
            low: t.price,
            close: t.price,
          })
        }
      }
    }
    return () => ws.close()
  }, [mint, onPriceUpdate])

  return (
    <div className="space-y-4">
      {/* Header NYRA / SOL + Timeframes */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">NYRA / SOL</h2>
        <div className="flex gap-2">
          {['1m', '5m', '1h', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                timeframe === tf
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'bg-[#1f2937] text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid chart / order flow */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <div className="col-span-2 bg-[#111827] rounded-xl border border-[#1f2937] p-4 shadow-md">
          <div ref={chartContainerRef} className="w-full h-[450px]" />
        </div>

        {/* Order flow */}
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-4 shadow-md">
          <h3 className="font-semibold mb-4 text-sm text-gray-300">Dernières opérations</h3>
          <ul className="text-xs font-mono space-y-2 max-h-[450px] overflow-y-auto">
            {trades.map((t, i) => (
              <li
                key={i}
                className={`flex justify-between ${
                  t.side === 'BUY' ? 'text-[#22d3ee]' : 'text-[#f43f5e]'
                }`}
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
