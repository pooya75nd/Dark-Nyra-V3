import React from 'react'

export default function OrdersBox({ coin }) {
  // Ici on pourrait brancher une API pour des "orderbook" réels
  const dummyOrders = [
    { side: 'BUY', size: 1.2, price: 2700 },
    { side: 'SELL', size: 0.8, price: 2715 },
    { side: 'BUY', size: 2.1, price: 2690 },
  ]

  return (
    <div className="bg-gray-900 p-3 rounded border border-gray-800">
      <h3 className="font-semibold mb-2 text-sm">Derniers ordres ({coin})</h3>
      <ul className="text-xs space-y-1">
        {dummyOrders.map((o,i)=>(
          <li key={i} className="flex justify-between">
            <span>{o.side}</span>
            <span>{o.size}</span>
            <span>@ {o.price}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
