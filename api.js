const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function toQuery(obj){const s=new URLSearchParams(obj);const q=s.toString();return q?`?${q}`:''}

function getToken(){ try{return localStorage.getItem('token')||''}catch{return ''} }
function setToken(t){ try{ localStorage.setItem('token', t) } catch{} }
function clearToken(){ try{ localStorage.removeItem('token') } catch{} }

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Authorization: getToken()?`Bearer ${getToken()}`:undefined, ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export const getProducts = () => api('/products')
export const createProduct = (body) => api('/products', { method: 'POST', body: JSON.stringify(body) })
export const listTransactions = (params={}) => api('/transactions' + toQuery(params)) // (not implemented in backend, placeholder)
export const createTxn = (body) => api('/transactions/create', { method: 'POST', body: JSON.stringify(body) })

export default api

export const refundTxn = (id) => api(`/transactions/${id}/refund`, { method: 'POST' })

export const exportTransactionsUrl = (params={}) => {
  const base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
  const s = new URLSearchParams(params)
  return `${base}/transactions/export?${s.toString()}`
}

export async function login(email, password){
  const data = await api('/auth/login?'+new URLSearchParams({email,password}), { method: 'POST' })
  setToken(data.access_token); return data
}
export async function me(){
  return api('/auth/me')
}
export function logout(){ clearToken() }

export const listLocations = (merchant_id) => api('/locations' + (merchant_id?`?merchant_id=${merchant_id}`:''))
export const createCheckoutLink = (body) => api('/checkout/create', { method: 'POST', body: JSON.stringify(body) })

export const createLocation = (body) => api('/locations', { method: 'POST', body: JSON.stringify(body) })
export const updateLocation = (id, body) => api(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteLocation = (id) => api(`/locations/${id}`, { method: 'DELETE' })
export const createStripeCheckout = (body) => api('/checkout/stripe_session', { method: 'POST', body: JSON.stringify(body) })

export const getMerchant = (id) => api(`/merchants/${id}`)
