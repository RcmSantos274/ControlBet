'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Surebet } from '@/types'

export function useSurebets() {
  const [surebets, setSurebets] = useState<Surebet[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/surebets')
    setSurebets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function add(sb: Omit<Surebet, 'id'>) {
    const res = await fetch('/api/surebets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sb),
    })
    const nova = await res.json()
    setSurebets(prev => [nova, ...prev])
  }

  async function update(sb: Surebet) {
    const res = await fetch(`/api/surebets/${sb.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sb),
    })
    const updated = await res.json()
    setSurebets(prev => prev.map(s => s.id === sb.id ? updated : s))
  }

  async function remove(id: string) {
    await fetch(`/api/surebets/${id}`, { method: 'DELETE' })
    setSurebets(prev => prev.filter(s => s.id !== id))
  }

  return { surebets, loading, refresh, add, update, remove }
}
