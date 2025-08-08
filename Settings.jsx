import React from 'react'

export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-2">
        <div className="text-sm text-gray-700">Set the backend API URL by creating a <code>.env</code> file with:</div>
        <pre className="bg-gray-100 p-2 rounded">&nbsp;VITE_API_URL=http://127.0.0.1:8000</pre>
        <div className="text-sm text-gray-500">Then restart <code>npm run dev</code>.</div>
      </div>
    </div>
  )
}
