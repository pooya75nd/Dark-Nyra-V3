mport React, { useEffect, useState } from 'react'
import PumpBoard from './components/PumpBoard.jsx'
import TopCoins from './components/TopCoins.jsx'
import ChatBox from './components/ChatBox.jsx'

const DEV_WALLET = 'DqFkaTK8fkxpduK9x68qEVnH9CZqVqMap6WvzqJLVem3'
const SOLANA_RPC = 'https://mainnet.helius-rpc.com/?api-key=3da4ec24-c4bf-41d8-92aa-1e22c78fd03f'
const MINT_DARK_NYRA = '3w8qd4jrStowiK8LUzAsHhu9L5JbpiyVcMtjSgs1kJg4'

// Fonction pour récupérer le solde du wallet en SOL
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
        if (!stop) setTimeout(loop, 30000) // refresh 30s
      }
    }
    loop()
    return () => { stop = true }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-black text-white font-sans">
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between border-b border-purple-900/40 shadow-lg shadow-purple-900/40">
        {/* Logo + infos */}
        <div className="flex items-center gap-3">
          <img
            src="/dark-nyra-logo.png"
            alt="Dark Nyra"
            className="h-12 w-12 rounded-full border border-purple-500 shadow-[0_0_15px_#a855f7] object-contain"
          />
          <div>
            <div className="font-bold text-green-400 text-lg drop-shadow-[0_0_5px_#39ff14]">Dark Nyra</div>
            <div className="text-xs text-gray-400 italic">Neon chaos. Clean gains.</div>
            <div className="text-sm text-red-500">
              Dev Balance: {devBalance !== null ? devBalance.toFixed(4) : '—'} SOL
            </div>
          </div>
        </div>

        {/* Onglets */}
        <nav className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t)}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 
                ${active.key === t.key 
                  ? 'bg-gradient-to-r from-purple-600 to-green-400 text-black shadow-[0_0_10px_#39ff14,0_0_20px_#a855f7]'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}
              `}
            >
              {t.title}
            </button>
          ))}
        </nav>
      </header>

      {/* CONTENU */}
      <main className="p-4 max-w-6xl mx-auto">
        {active.render()}
      </main>
    </div>
  )
}
