import React from 'react'

export default function OrdersBox({ coin }) {
  // Placeholder (simule quelques ordres récents)
  const dummyOrders = [
    { side: 'BUY', size: 1.2, price: 2700 },
    { side: 'SELL', size: 0.8, price: 2715 },
    { side: 'BUY', size: 2.1, price: 2690 },
  ]

  return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800 h-full">
      <h3 className="font-semibold mb-4 text-sm">Derniers ordres ({coin})</h3>
      <ul className="text-xs font-mono space-y-2">
        {dummyOrders.map((o, i) => (
          <li 
            key={i} 
            className={`flex justify-between ${
              o.side === 'BUY' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <span>{o.side}</span>
            <span>{o.size}</span>
            <span>@ {o.price}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
