import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// ✅ Mets bien ton URL et ta clé anon ici
const supabase = createClient(
  "https://hzksjjiugkfnzusaxdhr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6a3Noaml1Z2tmbnp1c2F4ZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjU0MjMsImV4cCI6MjA3NDc0MTQyM30.lXxh3xKReNcx1HY92Su246JI1PEViQXmyykbT7EdSSs"
)

export default function ChatBox() {
  const [messages, setMessages] = useState([])
  const [pseudo, setPseudo] = useState(localStorage.getItem('pseudo') || '')
  const [text, setText] = useState('')

  // Charger les messages + écouter en temps réel
  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel('realtime:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadMessages() {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })

    if (!error) setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!pseudo || !text.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert([{ pseudo, content: text }])

    if (!error) {
      setText('')
    } else {
      console.error('Erreur envoi message', error)
    }
  }

  if (!pseudo) {
    return (
      <div className="p-6 bg-[#1a1a1a] rounded-lg border border-gray-800 max-w-md mx-auto">
        <h2 className="font-semibold mb-4">Choisissez un pseudo</h2>
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Votre pseudo"
          className="px-3 py-2 w-full text-black rounded"
        />
        <button
          onClick={() => localStorage.setItem('pseudo', pseudo)}
          className="mt-3 px-4 py-2 bg-amber-400 text-black font-semibold rounded w-full"
        >
          Entrer dans le chat
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-4 rounded-lg border border-gray-800">
      <h2 className="font-semibold mb-4">Chat en direct</h2>
      <div className="h-80 overflow-y-auto space-y-2 mb-4">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="text-gray-500 text-xs">
              [{new Date(m.created_at).toLocaleTimeString()}]
            </span>{' '}
            <span className="font-semibold text-amber-400">{m.pseudo}</span> :{' '}
            <span>{m.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 px-3 py-2 rounded text-black"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-amber-400 text-black font-semibold rounded"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
