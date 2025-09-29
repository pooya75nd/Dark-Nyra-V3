import React, { useEffect, useState } from 'react'
import CoinChart from './CoinChart.jsx'
import OrderBook from './OrderBook.jsx'

export default function TopCoins() {
  const [coins, setCoins] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")
      .then(r => r.json())
      .then(setCoins)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* LISTE DES CRYPTOS */}
      <div className="col-span-1 bg-[#111827] rounded-xl border border-[#1f2937] p-4 shadow-md overflow-y-auto max-h-[600px]">
        <h2 className="font-semibold text-sm mb-4 text-gray-300">Top 100 Cryptos</h2>
        <ul className="space-y-2">
          {coins.map(c => (
            <li 
              key={c.id}
              onClick={() => setSelected(c)}
              className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer transition 
                ${selected?.id === c.id 
                  ? 'bg-violet-600 text-white' 
                  : 'hover:bg-[#1f2937] text-gray-300'}`}
            >
              <span className="font-semibold text-sm">{c.symbol.toUpperCase()}</span>
              <span className="text-xs">${c.current_price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* GRAPHIQUE */}
      <div className="col-span-2 bg-[#111827] rounded-xl border border-[#1f2937] p-4 shadow-md">
        {selected ? (
          <CoinChart geckoId={selected.id} symbol={selected.symbol.toUpperCase()} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Sélectionnez une crypto à gauche
          </div>
        )}
      </div>

      {/* ORDER BOOK */}
      <div className="col-span-1 bg-[#111827] rounded-xl border border-[#1f2937] p-4 shadow-md">
        {selected ? (
          <OrderBook coin={selected.symbol.toUpperCase()} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Order book
          </div>
        )}
      </div>
    </div>
  )
}
