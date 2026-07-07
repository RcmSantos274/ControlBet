'use client'
import dynamic from 'next/dynamic'

const AnaliseClient = dynamic(() => import('../../analise/AnaliseClient'), { ssr: false })

export default function BasqueteAnalisePage() {
  return <AnaliseClient sport="basquete" />
}
