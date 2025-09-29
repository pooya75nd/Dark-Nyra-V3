import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  "https://hzksjjiugkfnzusaxdhr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6a3Noaml1Z2tmbnp1c2F4ZGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNjU0MjMsImV4cCI6MjA3NDc0MTQyM30.lXxh3xKReNcx1HY92Su246JI1PEViQXmyykbT7EdSSs"
)

export default function ChatBox(){
  const [messages,setMessages]=useState([])
  const [pseudo,setPseudo]=useState(localStorage.getItem('pseudo')||'')
  const [text,setText]=useState('')

  useEffect(()=>{
    loadMessages()
    const channel=supabase.channel('public:messages')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},payload=>{
        setMessages(m=>[...m,payload.new])
      })
      .subscribe()
    return ()=>{supabase.removeChannel(channel)}
  },[])

  async function loadMessages(){
    const {data}=await supabase.from('messages').select('*').order('created_at')
    setMessages(data||[])
  }

  async function sendMessage(e){
    e.preventDefault()
    if(!pseudo||!text) return
    await supabase.from('messages').insert([{pseudo,content:text}])
    setText('')
  }

  if(!pseudo) return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Entrez un pseudo pour rejoindre le chat</h2>
      <input value={pseudo} onChange={e=>setPseudo(e.target.value)} className="px-2 py-1 text-black"/>
      <button onClick={()=>localStorage.setItem('pseudo',pseudo)} className="ml-2 px-3 py-1 bg-gray-800">OK</button>
    </div>
  )

  return (
    <div className="p-4">
      <h2 className="font-bold mb-2">Chat</h2>
      <div className="h-64 overflow-y-auto bg-gray-900 p-2 mb-2 rounded">
        {messages.map(m=>(
          <div key={m.id} className="text-sm"><span className="text-gray-400">[{new Date(m.created_at).toLocaleTimeString()}]</span> <b>{m.pseudo}</b>: {m.content}</div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 px-2 py-1 text-black" placeholder="Votre message..."/>
        <button type="submit" className="px-3 py-1 bg-gray-800">Envoyer</button>
      </form>
    </div>
  )
}
