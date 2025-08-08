import React, { useEffect, useState } from 'react'
import { me } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Protected({ children }){
  const [ok, setOk] = useState(false)
  const navigate = useNavigate()
  useEffect(()=>{
    (async()=>{
      try{ await me(); setOk(true) } catch{ navigate('/login') }
    })()
  }, [])
  return ok ? children : null
}
