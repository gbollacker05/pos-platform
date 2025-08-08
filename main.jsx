import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Protected from './components/Protected'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import Charts from './pages/Charts'
import Login from './pages/Login'
import CheckoutLinks from './pages/CheckoutLinks'
import LocationsAdmin from './pages/LocationsAdmin'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <Protected><Layout /></Protected>,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <Products /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'charts', element: <Charts /> },
      { path: 'settings', element: <Settings /> },
      { path: 'checkout', element: <CheckoutLinks /> },
      { path: 'admin/locations', element: <LocationsAdmin /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
