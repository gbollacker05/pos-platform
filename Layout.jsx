import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { me, logout } from '../lib/api'
import React, { useEffect, useState } from 'react'

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation()
  const active = pathname === to || (to !== '/' && pathname.startsWith(to))
  return (
    <Link to={to} className={`px-3 py-2 rounded-lg hover:bg-gray-100 ${active ? 'bg-gray-200 font-semibold' : ''}`}>
      {children}
    </Link>
  )
}

export default function Layout() {
  const [role, setRole] = useState('staff')
  useEffect(()=>{ (async()=>{ try{ const u = await me(); setRole(u.role||'staff') }catch(e){} })() }, [])
  return (
    <div className="min-h-screen grid grid-cols-[220px_1fr]">
      <aside className="bg-white border-r p-4">
        <div className="text-xl font-bold mb-4">PayDash</div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/transactions">Transactions</NavLink>
          <NavLink to="/charts">Analytics</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <NavLink to="/checkout">Checkout Links</NavLink>
          {role==='admin' && <NavLink to="/admin/locations">Locations (Admin)</NavLink>}
        </nav>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
