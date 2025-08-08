import React, { useEffect, useState } from 'react'
import { me } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

async function fetchJson(url, opts={}){
  const res = await fetch(url, { ...opts, headers: { 'Content-Type':'application/json', ...(opts.headers||{}), Authorization: localStorage.getItem('token')?`Bearer ${localStorage.getItem('token')}`:undefined } })
  if(!res.ok) throw new Error('HTTP '+res.status)
  return res.json()
}

export default function Charts(){
  const [series, setSeries] = useState([])
  const [summary, setSummary] = useState({ count: 0, amount: 0})
  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

  useEffect(()=>{
    (async()=>{
      try{
        await me()
        const byDay = await fetchJson(`${base}/analytics/sales/by_day?days=14`)
        const sum = await fetchJson(`${base}/analytics/sales/summary`)
        setSeries(byDay.map(d=>({ day: d.day, amount: d.amount/100 })))
        setSummary(sum)
      }catch(e){ console.error(e) }
    })()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Total Sales</div>
          <div className="text-3xl font-bold">${(summary.amount/100).toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Transactions</div>
          <div className="text-3xl font-bold">{summary.count}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Avg Ticket</div>
          <div className="text-3xl font-bold">${summary.count? (summary.amount/summary.count/100).toFixed(2): '0.00'}</div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm h-[360px]">
        <h2 className="text-lg font-semibold mb-3">Sales — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
