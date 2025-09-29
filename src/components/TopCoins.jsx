import React, { useEffect, useState } from 'react'
import GeckoBoard from './GeckoBoard.jsx'

export default function TopCoins(){
  const [coins,setCoins]=useState([])
  const [selected,setSelected]=useState(null)

  useEffect(()=>{
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1")
      .then(r=>r.json()).then(setCoins)
  },[])

  return (
    <div>
      <h2 className="font-bold mb-2">Top 100 Cryptos</h2>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {coins.map(c=>(
          <li key={c.id} className="bg-gray-900 p-2 rounded cursor-pointer" onClick={()=>setSelected(c.id)}>
            <div className="font-semibold">{c.symbol.toUpperCase()}</div>
            <div className="text-xs text-gray-400">{c.name}</div>
            <div className="text-sm">${c.current_price}</div>
          </li>
        ))}
      </ul>
      {selected && <GeckoBoard geckoId={selected} />}
    </div>
  )
}
