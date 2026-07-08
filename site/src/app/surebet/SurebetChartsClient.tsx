'use client'
import { useState, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { Surebet } from '@/types'
import styles from './surebet.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const GC  = 'rgba(148,163,184,.10)'
const GC2 = 'rgba(148,163,184,.14)'
const TC  = '#e5e7eb'
const C = {
  green: '#00f0a8', greenDark: 'rgba(0,240,168,.55)',
  red:   '#ff3b68', redDark:   'rgba(255,59,104,.55)',
  blue:  '#4d9fff', blueDark:  'rgba(77,159,255,.45)',
}

function fmtShort(v: number) {
  if (v === 0) return ''
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : '+'
  if (abs >= 1000) return `${sign}R$${(abs / 1000).toFixed(1)}k`
  return `${sign}R$${abs.toFixed(0)}`
}
function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const dlV = {
  anchor: 'end' as const, align: 'start' as const, offset: 4, clip: false,
  color: (ctx: any) => (ctx.dataset.data[ctx.dataIndex] as number) >= 0 ? 'rgba(0,240,168,.9)' : 'rgba(255,59,104,.9)',
  font: { size: 11, weight: 700 as const },
  formatter: (v: number) => fmtShort(v),
}
const dlH = {
  anchor: 'end' as const, align: 'start' as const, offset: 5, clip: false,
  color: (ctx: any) => (ctx.dataset.data[ctx.dataIndex] as number) >= 0 ? 'rgba(0,240,168,.9)' : 'rgba(255,59,104,.9)',
  font: { size: 11, weight: 700 as const },
  formatter: (v: number) => fmtShort(v),
}

const xAxis = (currency = false) => ({
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, ...(currency ? { callback: (v: any) => 'R$' + Number(v).toFixed(0) } : {}) },
  grid: { color: GC },
})
const yAxis = (currency = false) => ({
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, ...(currency ? { callback: (v: any) => 'R$' + Number(v).toFixed(0) } : {}) },
  grid: { color: GC2 },
})

function ChartCard({ icon, title, subtitle, children, large }: {
  icon: string; title: string; subtitle: string; children: React.ReactNode; large?: boolean
}) {
  return (
    <div className={`${styles.chartCard} ${large ? styles.chartLarge : ''}`}>
      <div className={styles.chartHeader}>
        <div className={styles.chartIcon}>{icon}</div>
        <div>
          <div className={styles.chartTitle}>{title}</div>
          <div className={styles.chartSubtitle}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return <div className={styles.sectionHeader}><span /><h2>{title}</h2></div>
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

interface Props { surebets: Surebet[] }

export default function SurebetChartsClient({ surebets }: Props) {
  const [diasFiltro, setDiasFiltro] = useState<7|14|30>(30)

  const done = surebets.filter(sb => sb.resultado1 !== 'pendente' || sb.resultado2 !== 'pendente')

  const byDayAll = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const d = (sb.dataEvento || sb.dataAposta || '').slice(0, 10)
      if (!d) return
      map[d] = parseFloat(((map[d] || 0) + sb.lucro).toFixed(2))
    })
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    return {
      labels: sorted.map(([d]) => { const [, m, dd] = d.split('-'); return `${dd}/${m}` }),
      data:   sorted.map(([, v]) => v),
    }
  }, [done])

  const byDayFiltered = useMemo(() => ({
    labels: byDayAll.labels.slice(-diasFiltro),
    data:   byDayAll.data.slice(-diasFiltro),
  }), [byDayAll, diasFiltro])

  const byMonth = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const key = (sb.dataEvento || sb.dataAposta || '').slice(0, 7)
      if (!key) return
      map[key] = parseFloat(((map[key] || 0) + sb.lucro).toFixed(2))
    })
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    return {
      labels: sorted.map(([k]) => { const [y, m] = k.split('-'); return `${MESES[+m - 1]}/${y.slice(2)}` }),
      data:   sorted.map(([, v]) => v),
    }
  }, [done])

  const byCasa = useMemo(() => {
    const map: Record<string, number> = {}
    surebets.forEach(sb => {
      if (sb.casa1) map[sb.casa1] = (map[sb.casa1] || 0) + 1
      if (sb.casa2) map[sb.casa2] = (map[sb.casa2] || 0) + 1
    })
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a)
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) }
  }, [surebets])

  const byEsporte = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const key = sb.esporte || 'Outros'
      map[key] = parseFloat(((map[key] || 0) + sb.lucro).toFixed(2))
    })
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a)
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) }
  }, [done])

  if (surebets.length === 0) return null

  const filterBtn = (d: 7|14|30) => (
    <button key={d} onClick={() => setDiasFiltro(d)} style={{
      padding: '.22rem .65rem', borderRadius: '6px', fontSize: '.78rem', fontWeight: 700, cursor: 'pointer',
      background: diasFiltro === d ? 'rgba(0,240,168,.15)' : 'transparent',
      color:      diasFiltro === d ? '#00f0a8' : '#94a3b8',
      border:    `1px solid ${diasFiltro === d ? '#00f0a8' : 'rgba(148,163,184,.25)'}`,
      transition: 'all .15s',
    }}>{d}d</button>
  )

  return (
    <>
      <SectionHeader title="Lucro por Dia" />

      <ChartCard icon="▦" title="Resultado Diário (R$)" subtitle="Lucro ou prejuízo por dia de eventos." large>
        <div style={{ display: 'flex', gap: '.4rem', marginBottom: '1rem', justifyContent: 'flex-end' }}>
          {([7, 14, 30] as const).map(filterBtn)}
        </div>
        <div className={styles.chartWrap} style={{ height: 320 }}>
          <Bar
            plugins={[ChartDataLabels]}
            data={{ labels: byDayFiltered.labels, datasets: [{ data: byDayFiltered.data, backgroundColor: byDayFiltered.data.map(v => v >= 0 ? C.greenDark : C.redDark), borderColor: byDayFiltered.data.map(v => v >= 0 ? C.green : C.red), borderWidth: 2, borderRadius: 5 }] }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: diasFiltro < 30 ? 22 : 8 } },
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.y ?? 0) } },
                datalabels: { ...dlV, display: diasFiltro < 30, font: { size: diasFiltro === 7 ? 11 : 10, weight: 700 } },
              },
              scales: {
                x: { ticks: { color: TC, font: { size: diasFiltro === 30 ? 10 : 12, weight: 700 }, maxRotation: diasFiltro === 30 ? 45 : 0, minRotation: diasFiltro === 30 ? 45 : 0 }, grid: { color: GC } },
                y: yAxis(true),
              },
            } as any}
          />
        </div>
      </ChartCard>

      <ChartCard icon="📅" title="Lucro / Prejuízo por Mês" subtitle="Resultado mensal acumulado de todas as surebets resolvidas." large>
        <div className={styles.chartWrap} style={{ height: 300 }}>
          <Bar
            plugins={[ChartDataLabels]}
            data={{ labels: byMonth.labels, datasets: [{ data: byMonth.data, backgroundColor: byMonth.data.map(v => v >= 0 ? C.greenDark : C.redDark), borderColor: byMonth.data.map(v => v >= 0 ? C.green : C.red), borderWidth: 2, borderRadius: 6, barThickness: Math.min(72, Math.max(32, 320 / Math.max(byMonth.labels.length, 1))) }] }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: 26 } },
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.y ?? 0) } },
                datalabels: { ...dlV, font: { size: 11, weight: 700 } },
              },
              scales: { x: xAxis(), y: yAxis(true) },
            } as any}
          />
        </div>
      </ChartCard>

      <SectionHeader title="Distribuição" />

      <div className={styles.grid2}>
        <ChartCard icon="🏠" title="Apostas por Casa de Aposta" subtitle="Quantidade de vezes que cada bookmaker foi utilizado nas surebets.">
          <div className={styles.chartWrap} style={{ height: Math.max(220, byCasa.labels.length * 42 + 60) }}>
            <Bar
              plugins={[ChartDataLabels]}
              data={{ labels: byCasa.labels, datasets: [{ data: byCasa.data, backgroundColor: C.blueDark, borderColor: C.blue, borderWidth: 2, borderRadius: 4 }] }}
              options={{
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                layout: { padding: { right: 40 } },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (c: any) => `${c.parsed.x ?? 0} apostas` } },
                  datalabels: {
                    anchor: 'end' as const, align: 'start' as const, offset: 5, clip: false,
                    color: C.blue,
                    font: { size: 11, weight: 700 as const },
                    formatter: (v: number) => String(v),
                  },
                },
                scales: { x: xAxis(), y: { ticks: { color: TC, font: { size: 13, weight: 700 } }, grid: { color: GC } } },
              } as any}
            />
          </div>
        </ChartCard>

        <ChartCard icon="⚽" title="Lucro por Esporte (R$)" subtitle="Resultado líquido acumulado em cada esporte.">
          <div className={styles.chartWrap} style={{ height: Math.max(220, byEsporte.labels.length * 48 + 60) }}>
            <Bar
              plugins={[ChartDataLabels]}
              data={{ labels: byEsporte.labels, datasets: [{ data: byEsporte.data, backgroundColor: byEsporte.data.map(v => v >= 0 ? C.greenDark : C.redDark), borderColor: byEsporte.data.map(v => v >= 0 ? C.green : C.red), borderWidth: 2, borderRadius: 4 }] }}
              options={{
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                layout: { padding: { right: 52 } },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.x ?? 0) } },
                  datalabels: dlH,
                },
                scales: { x: xAxis(true), y: { ticks: { color: TC, font: { size: 13, weight: 700 } }, grid: { color: GC } } },
              } as any}
            />
          </div>
        </ChartCard>
      </div>
    </>
  )
}
