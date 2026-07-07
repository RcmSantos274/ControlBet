'use client'
import dynamic from 'next/dynamic'

const AnaliseClient = dynamic(() => import('./AnaliseClient'), { ssr: false })

export default function AnalisePage() {
  return <AnaliseClient sport="futebol" />
}
