import React, { useEffect, useRef, useState } from 'react'
import { createChart } from 'lightweight-charts'

export default function PumpBoard({ projectName, mint }){
  const chartRef = useRef(null)
  const seriesRef = useRef(null)
  const [trades,setTrades]=useState([])

  useEffect(()=>{
    const chart=createChart(chartRef.current,{width:600,height:300,layout:{background:{color:'#000'},textColor:'#fff'}})
    const s=chart.addCandlestickSeries()
    seriesRef.current=s
    return ()=>chart.remove()
  },[])

  useEffect(()=>{
    const ws=new WebSocket("wss://pumpportal.fun/api/data")
    ws.onopen=()=>ws.send(JSON.stringify({method:'subscribeTokenTrade',keys:[mint]}))
    ws.onmessage=e=>{
      const msg=JSON.parse(e.data)
      if(msg.channel==='tokenTrade'&&msg.data){
        const d=msg.data
        setTrades(t=>[d,...t].slice(0,20))
      }
    }
    return ()=>ws.close()
  },[mint])

  return (
    <div>
      <h2 className="font-bold mb-2">{projectName} Board</h2>
      <div ref={chartRef} style={{height:300}}/>
      <ul className="mt-2 text-sm">
        {trades.map((t,i)=>(<li key={i}>{t.side} {t.size} @ {t.price}</li>))}
      </ul>
    </div>
  )
}
