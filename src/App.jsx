import React, { useEffect, useState } from 'react'
import DarkNyraBoard from './components/DarkNyraBoard.jsx'
import TopCoins from './components/TopCoins.jsx'
import ChatBox from './components/ChatBox.jsx'

const DEV_WALLET = 'DqFkaTK8fkxpduK9x68qEVnH9CZqVqMap6WvzqJLVem3'
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=3da4ec24-c4bf-41d8-92aa-1e22c78fd03f'
const MINT_DARK_NYRA = '3w8qd4jrStowiK8LUzAsHhu9L5JbpiyVcMtjSgs1kJg4'

async function getSolBalance(pubkey) {
  const resp = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [pubkey] }),
  })
  const json = await resp.json()
  return (json?.result?.value ?? 0) / 1e9
}

const TABS = [
  { key: 'darknyra', title: 'Dark Nyra' },
  { key: 'top', title: 'Top 100' },
  { key: 'chat', title: 'Chat' },
]

export default function App() {
  const [active, setActive] = useState(TABS[0])
  const [devBalance, setDevBalance] = useState(null)

  const [price, setPrice] = useState(null)
  const [priceStart, setPriceStart] = useState(null)
  const [change24h, setChange24h] = useState(null)
  const [volume24h, setVolume24h] = useState(0)

  // Dev wallet balance
  useEffect(() => {
    let stop = false
    async function loop() {
      try {
        const bal = await getSolBalance(DEV_WALLET)
        if (!stop) setDevBalance(bal)
      } finally {
        if (!stop) setTimeout(loop, 30000)
      }
    }
    loop()
    return () => { stop = true }
  }, [])

  // Simulation variation 24h (si pas d’API OHLC)
  useEffect(() => {
    if (price !== null && priceStart === null) {
      setPriceStart(price)
    }
    if (price !== null && priceStart !== null) {
      const pct = ((price - priceStart) / priceStart) * 100
      setChange24h(pct)
      setVolume24h(v => v + Math.random() * 100) // simulation volume
    }
  }, [price, priceStart])

  return (
    <div className="min-h-screen bg-background text-gray-100 font-sans">
      {/* HEADER */}
      <header className="px-6 py-3 border-b border-[#1f2937] bg-[#0e0e23] flex items-center justify-between shadow">
  {/* LOGO + NAME */}
  <div className="flex items-center gap-3">
    <img src="/dark-nyra-logo.png" alt="Dark Nyra" className="h-9 w-9 rounded-full object-contain" />
    <div>
      <div className="text-lg font-bold text-white tracking-wide">Dark Nyra</div>
      <div className="text-xs text-gray-400">Crypto Intelligence Dashboard</div>
    </div>
  </div>

  {/* MINI DASHBOARD */}
  <div className="flex items-center gap-8 text-sm">
    <div className="text-center">
      <div className="text-gray-400 text-xs">Price</div>
      <div className="font-semibold text-white">{price ? `$${price.toFixed(4)}` : '—'}</div>
    </div>
    <div className="text-center">
      <div className="text-gray-400 text-xs">24h Change</div>
      <div className={change24h >= 0 ? 'text-[#22d3ee] font-semibold' : 'text-[#f43f5e] font-semibold'}>
        {change24h ? `${change24h.toFixed(2)}%` : '—'}
      </div>
    </div>
    <div className="text-center">
      <div className="text-gray-400 text-xs">24h Volume</div>
      <div className="text-white">{volume24h ? `$${(volume24h/1000).toFixed(1)}K` : '—'}</div>
    </div>
    <div className="text-center">
      <div className="text-gray-400 text-xs">Dev Balance</div>
      <div className="text-pink-500 font-mono">{devBalance !== null ? `${devBalance.toFixed(3)} SOL` : '—'}</div>
    </div>
  </div>

  {/* NAVIGATION TABS */}
  <nav className="flex gap-2">
    {TABS.map(t => (
      <button
        key={t.key}
        onClick={() => setActive(t)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition 
          ${active.key === t.key
            ? 'bg-violet-600 text-white shadow-md'
            : 'bg-[#1f2937] text-gray-400 hover:bg-violet-500 hover:text-white'
          }`}
      >
        {t.title}
      </button>
    ))}
  </nav>
      </header>

      {/* CONTENU */}
      <main className="p-8 max-w-7xl mx-auto">
        {active.key === 'darknyra' && (
          <DarkNyraBoard mint={MINT_DARK_NYRA} onPriceUpdate={setPrice} />
        )}
        {active.key === 'top' && <TopCoins />}
        {active.key === 'chat' && <ChatBox />}
      </main>
    </div>
  )
}
