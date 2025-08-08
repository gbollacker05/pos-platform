import React, { useEffect, useState } from 'react'
import { listLocations } from '../lib/api'

export default function LocationSelector({ merchantId='m_demo', value, onChange }){
  const [items, setItems] = useState([])
  useEffect(()=>{ (async()=>{ try{ setItems(await listLocations(merchantId)) }catch(e){} })() }, [merchantId])
  return (
    <select className="border rounded-lg px-3 py-2" value={value||''} onChange={e=>onChange?.(e.target.value?Number(e.target.value):'')}>
      <option value="">All Locations</option>
      {items.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
    </select>
  )
}
