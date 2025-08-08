import React, { useEffect, useState } from 'react'
import { getProducts, createProduct } from '../lib/api'
import LocationSelector from '../components/LocationSelector'

export default function Products() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', price_cents: 0, sku: '', location_id: '' })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    await createProduct({ ...form, price_cents: Number(form.price_cents) })
    setForm({ name: '', price_cents: 0, sku: '' })
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>

      <form onSubmit={add} className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Price (cents)" type="number" value={form.price_cents} onChange={e=>setForm({...form, price_cents:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} />
        <LocationSelector value={form.location_id} onChange={(v)=>setForm({...form, location_id:v})} />
        <button className="rounded-lg bg-black text-white px-4">Add</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">SKU</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan="4">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-3" colSpan="4">No products yet.</td></tr>
            ) : items.map(p => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">${(p.price_cents/100).toFixed(2)}</td>
                <td className="p-3">{p.sku || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
