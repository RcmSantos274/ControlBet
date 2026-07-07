'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Aposta } from '@/types'

export function useApostas(sport = 'futebol') {
  const [apostas, setApostas] = useState<Aposta[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/apostas?sport=${sport}`)
    setApostas(await res.json())
    setLoading(false)
  }, [sport])

  useEffect(() => { refresh() }, [refresh])

  async function add(bet: Aposta) {
    const res = await fetch('/api/apostas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bet, sport }),
    })
    const nova = await res.json()
    setApostas(prev => [nova, ...prev])
  }

  async function update(bet: Aposta) {
    const res = await fetch(`/api/apostas/${bet.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bet),
    })
    const updated = await res.json()
    setApostas(prev => prev.map(b => b.id === bet.id ? updated : b))
  }

  async function remove(id: string) {
    await fetch(`/api/apostas/${id}`, { method: 'DELETE' })
    setApostas(prev => prev.filter(b => b.id !== id))
  }

  async function save(data: Aposta[]) {
    await fetch(`/api/apostas/bulk?sport=${sport}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data.map(b => ({ ...b, sport }))),
    })
    await refresh()
  }

  return { apostas, loading, refresh, add, update, remove, save }
}
