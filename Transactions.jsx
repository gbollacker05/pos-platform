import React, { useEffect, useState } from 'react'
import { listTransactions, refundTxn, exportTransactionsUrl, me } from '../lib/api'

import LocationSelector from '../components/LocationSelector'

export default function Transactions() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ merchant_id: 'm_demo', status: '', start_date: '', end_date: '', location_id: '' })
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [sumAmount, setSumAmount] = useState(0)

  const load = async () => {
    setLoading(true)
    try {
      const res = await listTransactions({
        merchant_id: filters.merchant_id || undefined,
        status: filters.status || undefined,
    location_id: filters.location_id || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        limit,
        offset: page * limit,
        location_id: filters.location_id || undefined,
      })
      setRows(res.items || [])
      setTotal(res.total || 0)
      setSumAmount(res.sum_amount || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const [role, setRole] = useState('staff')
  useEffect(()=>{ (async()=>{ try{ const u = await me(); setRole(u.role||'staff') }catch(e){} })() }, [])
  useEffect(() => { load() }, [page, limit])

  const onSearch = (e) => { e.preventDefault(); setPage(0); load() }

  const doRefund = async (id) => {
    if (!confirm('Refund this transaction?')) return
    try {
      await refundTxn(id)
      load()
    } catch (e) {
      alert('Refund failed: ' + e.message)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const nextDisabled = page + 1 >= totalPages
  const prevDisabled = page === 0

  const exportUrl = exportTransactionsUrl({
    merchant_id: filters.merchant_id || undefined,
    status: filters.status || undefined,
    location_id: filters.location_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total in view</div>
          <div className="text-xl font-semibold">${(sumAmount/100).toFixed(2)}</div>
        </div>
      </div>

      <form onSubmit={onSearch} className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-7 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Merchant ID" value={filters.merchant_id} onChange={e=>setFilters({...filters, merchant_id:e.target.value})} />
        <select className="border rounded-lg px-3 py-2" value={filters.status} onChange={e=>setFilters({...filters, status:e.target.value})}>
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
          <option value="refunded">Refunded</option>
        </select>
        <input type="date" className="border rounded-lg px-3 py-2" value={filters.start_date} onChange={e=>setFilters({...filters, start_date:e.target.value})} />
        <input type="date" className="border rounded-lg px-3 py-2" value={filters.end_date} onChange={e=>setFilters({...filters, end_date:e.target.value})} />
        <LocationSelector merchantId={filters.merchant_id} value={filters.location_id} onChange={(v)=>setFilters({...filters, location_id: v})} />
        <select className="border rounded-lg px-3 py-2" value={limit} onChange={e=>{setLimit(Number(e.target.value)); setPage(0)}}>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
        <button className="rounded-lg bg-black text-white px-4 py-2">Search</button>
        <a href={exportUrl} className="rounded-lg border px-4 py-2 text-center" target="_blank" rel="noreferrer">Export CSV</a>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-auto">
        <table className="w-full text-left min-w-[850px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Created</th>
              <th className="p-3">Merchant</th>
              <th className="p-3">Amount</th><th className="p-3">Tax</th><th className="p-3">Tip</th><th className="p-3">Total</th>
              <th className="p-3">Currency</th>
              <th className="p-3">Status</th>
              <th className="p-3">Description</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan="8">Loading...</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="p-3" colSpan="8">No transactions.</td></tr>
            ) : rows.map(tx => (
              <tr key={tx.id} className="border-t">
                <td className="p-3 font-mono text-xs">{tx.id}</td>
                <td className="p-3 text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="p-3 text-sm">{tx.merchant_id}</td>
                <td className="p-3">${(tx.amount/100).toFixed(2)}</td><td className="p-3">${((tx.tax_cents||0)/100).toFixed(2)}</td><td className="p-3">${((tx.tip_cents||0)/100).toFixed(2)}</td><td className="p-3">${((tx.total_cents||tx.amount)/100).toFixed(2)}</td>
                <td className="p-3">{tx.currency}</td>
                <td className="p-3">{tx.status}</td>
                <td className="p-3">{tx.description || '-'}</td>
                <td className="p-3">
                  {tx.status === 'approved' ? (
                    <button onClick={()=>doRefund(tx.id)} className="text-sm rounded-md border px-3 py-1 hover:bg-gray-50">Refund</button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">Page {page + 1} / {totalPages} • Total records: {total}</div>
        <div className="flex gap-2">
          <button disabled={prevDisabled} onClick={()=>setPage(p=>Math.max(0, p-1))} className={"rounded-lg border px-3 py-2 " + (prevDisabled ? "opacity-50 cursor-not-allowed" : "")}>Prev</button>
          <button disabled={nextDisabled} onClick={()=>setPage(p=>p+1)} className={"rounded-lg border px-3 py-2 " + (nextDisabled ? "opacity-50 cursor-not-allowed" : "")}>Next</button>
        </div>
      </div>

      <p className="text-xs text-gray-500">Totals reflect the current filters/date window.</p>
    </div>
  )
}
