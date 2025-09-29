import React, { useEffect, useState } from 'react'
import CoinChart from './CoinChart.jsx'
import OrdersBox from './OrdersBox.jsx'

export default function TopCoins() {
  const [coins, setCoins] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")
      .then(r => r.json()).then(setCoins)
  }, [])

  return (
    <div>
      <h2 className="font-semibold text-lg mb-6">Top 100 Cryptos</h2>
      
      {/* Grille des cryptos */}
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {coins.map(c => (
          <li 
            key={c.id} 
            onClick={() => setSelected(c)} 
            className={`bg-[#1a1a1a] p-4 rounded-lg border transition cursor-pointer ${
              selected?.id === c.id ? 'border-amber-400' : 'border-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="font-semibold text-sm">{c.symbol.toUpperCase()}</div>
            <div className="text-xs text-gray-400">{c.name}</div>
            <div className="text-sm mt-1">${c.current_price.toLocaleString()}</div>
          </li>
        ))}
      </ul>

      {/* Section détails */}
      {selected && (
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 bg-[#1a1a1a] rounded-lg border border-gray-800 p-4">
            <CoinChart geckoId={selected.id} />
          </div>
          <div>
            <OrdersBox coin={selected.symbol.toUpperCase()} />
          </div>
        </div>
      )}
    </div>
  )
}
