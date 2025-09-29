import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function DarkNyraBoard({ mint, onPriceUpdate }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const candleSeriesRef = useRef(null)
  const [trades, setTrades] = useState([])
  const [timeframe, setTimeframe] = useState('1m')

  // Fonction pour récupérer les bougies OHLC depuis Pump.fun
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

  // Initialiser le graphique
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Crée le chart dans la div dédiée
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 450,
      layout: { background: { color: '#111' }, textColor: '#ddd' },
      grid: { vertLines: { color: '#1f1f1f' }, horzLines: { color: '#1f1f1f' } },
      crosshair: { mode: 1 },
    })
    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#4ade80',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#4ade80',
      wickDownColor: '#ef4444',
    })
    candleSeriesRef.current = candleSeries

    fetchOHLC(timeframe)

    // Resize dynamique
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [mint])

  // Rechargement des bougies quand timeframe change
  useEffect(() => {
    if (candleSeriesRef.current) {
      fetchOHLC(timeframe)
    }
  }, [timeframe])

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
    <div>
      {/* En-tête NYRA / SOL + sélecteur timeframe */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">NYRA / SOL</h2>
        <div className="flex gap-2">
          {['1m', '5m', '1h', '1d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm transition ${
                timeframe === tf
                  ? 'bg-accent text-black font-semibold'
                  : 'bg-panel text-gray-400 hover:text-gray-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Grille Chart / Order Flow */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart prend 2/3 largeur et reste dans sa div */}
        <div className="col-span-2 bg-panel rounded-lg border border-border p-4">
          <div ref={chartContainerRef} className="w-full h-[450px]" />
        </div>

        {/* Carnet d’ordres */}
        <div className="bg-panel rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-4 text-sm">Dernières opérations</h3>
          <ul className="text-xs font-mono space-y-2 max-h-[450px] overflow-y-auto">
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
    </div>
  )
}
