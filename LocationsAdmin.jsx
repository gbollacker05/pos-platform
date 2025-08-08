import React, { useEffect, useState } from 'react'
import { listLocations, createLocation, updateLocation, deleteLocation } from '../lib/api'

export default function LocationsAdmin(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ merchant_id: 'm_demo', name: '', address: '', tax_rate: '' })
  const [editing, setEditing] = useState(null)

  const load = async ()=>{
    const rows = await listLocations('m_demo')
    setItems(rows)
  }
  useEffect(()=>{ load() }, [])

  const submit = async (e)=>{
    e.preventDefault()
    if(editing){
      await updateLocation(editing.id, form)
      setEditing(null)
    }else{
      await createLocation(form)
    }
    setForm({ merchant_id: 'm_demo', name: '', address: '' })
    load()
  }

  const startEdit = (loc)=>{
    setEditing(loc)
    setForm({ merchant_id: loc.merchant_id, name: loc.name, address: loc.address || '', tax_rate: loc.tax_rate || '' })
  }

  const remove = async (id)=>{
    if(!confirm('Delete this location?')) return
    await deleteLocation(id)
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Locations (Admin)</h1>

      <form onSubmit={submit} className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Merchant ID" value={form.merchant_id} onChange={e=>setForm({...form, merchant_id:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="Tax rate (e.g., 0.0825)" value={form.tax_rate} onChange={e=>setForm({...form, tax_rate:e.target.value})} />
        <button className="rounded-lg bg-black text-white px-4">{editing ? 'Update' : 'Create'}</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Merchant</th>
              <th className="p-3">Name</th>
              <th className="p-3">Address</th><th className="p-3">Tax Rate</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length===0 ? (
              <tr><td className="p-3" colSpan="5">No locations yet.</td></tr>
            ) : items.map(l => (
              <tr key={l.id} className="border-t">
                <td className="p-3">{l.id}</td>
                <td className="p-3">{l.merchant_id}</td>
                <td className="p-3">{l.name}</td>
                <td className="p-3">{l.address || '-'}</td><td className="p-3">{l.tax_rate || '-'}</td>
                <td className="p-3 space-x-2">
                  <button onClick={()=>startEdit(l)} className="rounded-lg border px-3 py-1">Edit</button>
                  <button onClick={()=>remove(l.id)} className="rounded-lg border px-3 py-1">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
