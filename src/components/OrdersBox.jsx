import React, { useEffect, useState } from 'react'

export default function OrderBook({ coin }) {
  const [bids, setBids] = useState([])
  const [asks, setAsks] = useState([])

  // ⚠️ Ici je simule car CoinGecko n’a pas d’orderbook
  // Idéalement → brancher un vrai flux (Binance, Kraken, Pump.fun orderbook)
  useEffect(() => {
    const dummyBids = [
      { price: 2700, size: 1.2 },
      { price: 2699, size: 0.8 },
      { price: 2698, size: 2.1 },
    ]
    const dummyAsks = [
      { price: 2701, size: 0.5 },
      { price: 2702, size: 1.3 },
      { price: 2703, size: 0.9 },
    ]
    setBids(dummyBids)
    setAsks(dummyAsks)
  }, [coin])

  return (
    <div className="h-[500px] flex flex-col">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Order Book ({coin})</h3>
      {/* Bids (achats) */}
      <div className="flex-1 overflow-y-auto mb-2 border-b border-[#1f2937] pb-2">
        <h4 className="text-xs font-semibold text-teal-400 mb-1">Bids</h4>
        <ul className="text-xs font-mono space-y-1">
          {bids.map((o, i) => (
            <li key={i} className="flex justify-between text-teal-400">
              <span>{o.size}</span>
              <span>@ {o.price}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Asks (ventes) */}
      <div className="flex-1 overflow-y-auto pt-2">
        <h4 className="text-xs font-semibold text-pink-500 mb-1">Asks</h4>
        <ul className="text-xs font-mono space-y-1">
          {asks.map((o, i) => (
            <li key={i} className="flex justify-between text-pink-500">
              <span>{o.size}</span>
              <span>@ {o.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
