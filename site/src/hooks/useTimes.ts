'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Time } from '@/types'

export function useTimes() {
  const [times, setTimes] = useState<Time[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/times')
    setTimes(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Sync completo — mantém a mesma interface do localStorage
  const save = useCallback(async (data: Time[]) => {
    await fetch('/api/times/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setTimes(data)
  }, [])

  return { times, loading, save, refresh }
}
