import React, { useState } from 'react'
import { createCheckoutLink, createStripeCheckout } from '../lib/api'

export default function CheckoutLinks(){
  const [amount, setAmount] = useState('9.99')
  const [desc, setDesc] = useState('Online payment')
  const [token, setToken] = useState('')

  const createLink = async (e)=>{
    e.preventDefault()
    const cents = Math.round(parseFloat(amount||'0')*100)
    const link = await createCheckoutLink({ amount_cents: cents, description: desc })
    setToken(link.token)
  }

  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
  const url = token ? `${base}/checkout/${token}/page` : ''

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Checkout Links</h1>
      <form onSubmit={createLink} className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Amount (e.g., 9.99)" value={amount} onChange={e=>setAmount(e.target.value)} />
        <input className="border rounded-lg px-3 py-2" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button className="rounded-lg bg-black text-white px-4">Create Link</button>
      </form>
      {token && (
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Public URL</div>
          <div className="p-2 border rounded-lg break-all">{url}</div>
        </div>
      )}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Stripe Checkout (Card-not-present)</h2>
        <p className="text-sm text-gray-600 mb-3">Opens a hosted Stripe Checkout page. Set <code>STRIPE_SECRET_KEY</code> in the backend. Falls back to a demo URL if missing.</p>
        <button
          className="rounded-lg border px-4 py-2"
          onClick={async()=>{
            const cents = Math.round(parseFloat(amount||'0')*100)
            const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
            const success = window.location.origin + '/?paid=1'
            const cancel = window.location.origin + '/?canceled=1'
            const s = await createStripeCheckout({ amount_cents: cents, currency: 'USD', description: desc, success_url: success, cancel_url: cancel })
            window.open(s.url, '_blank')
          }}
        >Open Stripe Checkout</button>
      </div>
    </div>
  )
}
