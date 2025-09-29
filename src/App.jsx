import React, { useEffect, useState } from 'react'
import PumpBoard from './components/PumpBoard.jsx'
import TopCoins from './components/TopCoins.jsx'
import ChatBox from './components/ChatBox.jsx'

const DEV_WALLET = 'DqFkaTK8fkxpduK9x68qEVnH9CZqVqMap6WvzqJLVem3'
// RPC Helius (ta clé)
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=3da4ec24-c4bf-41d8-92aa-1e22c78fd03f'
// Mint Dark Nyra
const MINT_DARK_NYRA = '3w8qd4jrStowiK8LUzAsHhu9L5JbpiyVcMtjSgs1kJg4'

async function getSolBalance(pubkey) {
  const resp = await fetch(SOLANA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [pubkey],
    }),
  })
  const json = await resp.json()
  const lamports = json?.result?.value ?? 0
  return lamports / 1e9
}

const TABS = [
  { key: 'darknyra', title: 'Dark Nyra', render: () => <PumpBoard projectName="Dark Nyra" mint={MINT_DARK_NYRA} /> },
  { key: 'top',      title: 'Top 100',   render: () => <TopCoins /> },
  { key: 'chat',     title: 'Chat',      render: () => <ChatBox /> },
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
      } catch (e) {
        // silencieux
      } finally {
        if (!stop) setTimeout(loop, 30000) // refresh 30s
      }
    }
    loop()
    return () => { stop = true }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/dark-nyra-logo.png" alt="Dark Nyra" className="h-9 w-9" />
          <div>
            <div className="font-bold">Dark Nyra</div>
            <div className="text-xs text-gray-400">Neon chaos. Clean gains.</div>
            <div className="text-sm text-red-500">Dev Balance: {devBalance !== null ? devBalance.toFixed(4) : '—'} SOL</div>
          </div>
        </div>
        <nav className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActive(t)} className="px-3 py-1 bg-gray-800 rounded">
              {t.title}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {active.render()}
      </main>
    </div>
  )
}
