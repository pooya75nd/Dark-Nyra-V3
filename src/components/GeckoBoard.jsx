import React, { useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'

export default function GeckoBoard({ geckoId }){
  const ref=useRef(null)
  useEffect(()=>{
    const chart=createChart(ref.current,{width:600,height:300,layout:{background:{color:'#000'},textColor:'#fff'}})
    const s=chart.addLineSeries({color:'#0f0'})
    fetch(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=usd&days=1&interval=minute`)
      .then(r=>r.json()).then(d=>{
        const data=d.prices.map(p=>({time:Math.floor(p[0]/1000),value:p[1]}))
        s.setData(data)
      })
    return ()=>chart.remove()
  },[geckoId])
  return <div ref={ref} style={{height:300}}/>
}
