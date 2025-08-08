import React, { useEffect, useState } from 'react'
import { createTxn, me, getMerchant } from '../lib/api'
import LocationSelector from '../components/LocationSelector'

export default function Dashboard() {
  const [status, setStatus] = useState('')
  const [locationId, setLocationId] = useState('')
  const [taxRate, setTaxRate] = useState('0.08')
  const [tip, setTip] = useState('0.00')
  const [discount, setDiscount] = useState('0.00')
  const [tips, setTips] = useState([0.1,0.15,0.2])

  useEffect(()=>{ (async()=>{ try{ const u = await me(); if(u.merchant_id){ const m = await getMerchant(u.merchant_id); if(m.tip_suggestions){ try{ setTips(JSON.parse(m.tip_suggestions)) }catch{} } if(m.tax_rate_default){ setTaxRate(m.tax_rate_default) } } }catch(e){} })() }, [])

  const demoCharge = async () => {
    try {
      setStatus('Processing...')
      const res = await createTxn({ merchant_id: 'm_demo', amount: 999, currency: 'USD', description: 'Demo sale', location_id: locationId || undefined, tax_rate: parseFloat(taxRate||'0') || 0, tip_cents: Math.round(parseFloat(tip||'0')*100), discount_cents: Math.round(parseFloat(discount||'0')*100) })
      setStatus(`Transaction ${res.id}: ${res.status}`)
    } catch (e) {
      setStatus(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Today’s Sales</div>
          <div className="text-3xl font-bold">$0.00</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Transactions</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-gray-500">Refunds</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Quick Charge</h2>
        <div className="mb-2 flex gap-3 flex-wrap items-center">
          <LocationSelector value={locationId} onChange={setLocationId} />
          <input className="border rounded-lg px-3 py-2 w-28" placeholder="Tax rate" value={taxRate} onChange={e=>setTaxRate(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 w-28" placeholder="Tip $" value={tip} onChange={e=>setTip(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 w-28" placeholder="Discount $" value={discount} onChange={e=>setDiscount(e.target.value)} />
          <div className="flex items-center gap-2">{tips.map(t => (
            <button key={String(t)} type="button" className="rounded border px-2 py-1 text-sm" onClick={()=>setTip((9.99*t).toFixed(2))}>{Math.round(t*100)}%</button>
          ))}</div>
        </div>
        <button onClick={demoCharge} className="px-4 py-2 rounded-lg bg-black text-white">Run Demo $9.99 Sale</button>
        {status && <div className="mt-3 text-sm text-gray-700">{status}</div>}
        <p className="mt-2 text-xs text-gray-500">Requires the FastAPI backend from the MVP to be running locally.</p>
      </div>
    </div>
  )
}
