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
  { key: 'darknyra', title: 'Dark Nyra', render: () => <DarkNyraBoard mint={MINT_DARK_NYRA} /> },
  { key: 'top', title: 'Top 100', render: () => <TopCoins /> },
  { key: 'chat', title: 'Chat', render: () => <ChatBox /> },
]

export default function App() {
  const [active, setActive] = useState(TABS[0])
  const [devBalance, setDevBalance] = useState(null)

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

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-100 font-[Inter]">
      {/* HEADER */}
      <header className="px-8 py-4 border-b border-gray-800 flex items-center justify-between bg-[#111] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/dark-nyra-logo.png" alt="Dark Nyra" className="h-8 w-8 rounded-full object-contain" />
          <div>
            <div className="text-lg font-semibold tracking-wide">Dark Nyra</div>
            <div className="text-xs text-gray-500">Crypto Intelligence Dashboard</div>
          </div>
        </div>
        <div className="text-sm text-red-400 font-mono">
          Dev Balance: {devBalance !== null ? devBalance.toFixed(4) : '—'} SOL
        </div>
        <nav className="flex gap-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t)}
              className={`pb-1 transition ${
                active.key === t.key
                  ? 'border-b-2 border-amber-400 text-amber-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.title}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENU */}
      <main className="p-8 max-w-7xl mx-auto">
        {active.render()}
      </main>
    </div>
  )
}
