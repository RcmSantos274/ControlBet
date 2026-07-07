'use client'
import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { Surebet } from '@/types'
import styles from './surebet.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const GC  = 'rgba(148,163,184,.10)'
const GC2 = 'rgba(148,163,184,.14)'
const TC  = '#e5e7eb'
const GREEN   = '#00f0a8'
const GREEN_D = 'rgba(0,240,168,.55)'
const RED     = '#ff3b68'
const RED_D   = 'rgba(255,59,104,.55)'
const DAYS    = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function barColor(v: number)  { return v >= 0 ? GREEN_D : RED_D }
function barBorder(v: number) { return v >= 0 ? GREEN   : RED   }

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

// datalabels config for vertical bars
const datalabelsV = {
  anchor: 'end' as const,
  align:  'start' as const,
  offset: 4,
  color: (ctx: any) => {
    const v = ctx.dataset.data[ctx.dataIndex] as number
    return v >= 0 ? 'rgba(0,240,168,.9)' : 'rgba(255,59,104,.9)'
  },
  font: { size: 11, weight: 700 as const },
  formatter: (v: number) => fmtShort(v),
  clip: false,
}

// datalabels config for horizontal bars
const datalabelsH = {
  anchor: 'end' as const,
  align:  'start' as const,
  offset: 5,
  color: (ctx: any) => {
    const v = ctx.dataset.data[ctx.dataIndex] as number
    return v >= 0 ? 'rgba(0,240,168,.9)' : 'rgba(255,59,104,.9)'
  },
  font: { size: 11, weight: 700 as const },
  formatter: (v: number) => fmtShort(v),
  clip: false,
}

const xAxis = {
  ticks: { color: TC, font: { size: 13, weight: 700 as const } },
  grid:  { color: GC },
}
const yAxis = {
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, callback: (v: any) => `R$${Number(v).toFixed(0)}` },
  grid:  { color: GC2 },
}
const yAxisH = {
  ticks: { color: TC, font: { size: 13, weight: 700 as const } },
  grid:  { color: GC },
}
const xAxisH = {
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, callback: (v: any) => `R$${Number(v).toFixed(0)}` },
  grid:  { color: GC2 },
}

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
  return (
    <div className={styles.sectionHeader}>
      <span />
      <h2>{title}</h2>
    </div>
  )
}

interface Props { surebets: Surebet[] }

export default function SurebetChartsClient({ surebets }: Props) {
  const done = surebets.filter(sb => sb.resultado1 !== 'pendente' || sb.resultado2 !== 'pendente')

  const byDay = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const d = (sb.dataEvento || sb.dataAposta || '').slice(0, 10)
      if (!d) return
      map[d] = (map[d] || 0) + sb.lucro
    })
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    return {
      labels: sorted.map(([d]) => { const [, m, dd] = d.split('-'); return `${dd}/${m}` }),
      data:   sorted.map(([, v]) => parseFloat(v.toFixed(2))),
    }
  }, [done])

  const byWeekday = useMemo(() => {
    const acc = Array(7).fill(0)
    done.forEach(sb => {
      const d = new Date(sb.dataEvento || sb.dataAposta)
      acc[d.getDay()] = parseFloat((acc[d.getDay()] + sb.lucro).toFixed(2))
    })
    return { labels: DAYS, data: acc as number[] }
  }, [done])

  const byEsporte = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const key = sb.esporte || 'Outros'
      map[key] = parseFloat(((map[key] || 0) + sb.lucro).toFixed(2))
    })
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a)
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) }
  }, [done])

  const byMercado = useMemo(() => {
    const map: Record<string, number> = {}
    done.forEach(sb => {
      const winner =
        (sb.resultado1 === 'green' || sb.resultado1 === 'meio-green') ? sb.mercado1 :
        (sb.resultado2 === 'green' || sb.resultado2 === 'meio-green') ? sb.mercado2 :
        sb.mercado1
      const key = winner || 'Outros'
      map[key] = parseFloat(((map[key] || 0) + sb.lucro).toFixed(2))
    })
    const sorted = Object.entries(map).sort(([, a], [, b]) => b - a)
    return { labels: sorted.map(([k]) => k), data: sorted.map(([, v]) => v) }
  }, [done])

  if (done.length === 0) return null

  return (
    <>
      <SectionHeader title="Lucro por Dia" />
      <ChartCard icon="▦" title="Resultado Diário (R$)" subtitle="Lucro ou prejuízo acumulado por dia de eventos." large>
        <div className={styles.chartWrap} style={{ height: Math.max(260, byDay.labels.length * 40 + 80) }}>
          <Bar
            plugins={[ChartDataLabels]}
            data={{
              labels: byDay.labels,
              datasets: [{
                data: byDay.data,
                backgroundColor: byDay.data.map(barColor),
                borderColor:     byDay.data.map(barBorder),
                borderWidth: 2, borderRadius: 5,
              }],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: 22 } },
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.y ?? 0) } },
                datalabels: datalabelsV,
              },
              scales: { x: xAxis, y: yAxis },
            } as any}
          />
        </div>
      </ChartCard>

      <SectionHeader title="Lucro por Dia da Semana" />
      <ChartCard icon="📅" title="Resultado por Dia da Semana (R$)" subtitle="Acumulado de lucro/prejuízo agrupado por dia da semana.">
        <div className={styles.chartWrap} style={{ height: 300 }}>
          <Bar
            plugins={[ChartDataLabels]}
            data={{
              labels: byWeekday.labels,
              datasets: [{
                data: byWeekday.data,
                backgroundColor: byWeekday.data.map(barColor),
                borderColor:     byWeekday.data.map(barBorder),
                borderWidth: 2, borderRadius: 5,
              }],
            }}
            options={{
              responsive: true, maintainAspectRatio: false,
              layout: { padding: { top: 22 } },
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.y ?? 0) } },
                datalabels: datalabelsV,
              },
              scales: { x: xAxis, y: yAxis },
            } as any}
          />
        </div>
      </ChartCard>

      <div className={styles.grid2}>
        <ChartCard icon="⚽" title="Lucro por Esporte (R$)" subtitle="Resultado líquido acumulado em cada esporte.">
          <div className={styles.chartWrap} style={{ height: Math.max(200, byEsporte.labels.length * 48 + 60) }}>
            <Bar
              plugins={[ChartDataLabels]}
              data={{
                labels: byEsporte.labels,
                datasets: [{
                  data: byEsporte.data,
                  backgroundColor: byEsporte.data.map(barColor),
                  borderColor:     byEsporte.data.map(barBorder),
                  borderWidth: 2, borderRadius: 4,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                layout: { padding: { right: 52 } },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.x ?? 0) } },
                  datalabels: datalabelsH,
                },
                scales: { x: xAxisH, y: yAxisH },
              } as any}
            />
          </div>
        </ChartCard>

        <ChartCard icon="↗" title="Lucro por Mercado (R$)" subtitle="Resultado líquido acumulado por tipo de mercado apostado.">
          <div className={styles.chartWrap} style={{ height: Math.max(200, byMercado.labels.length * 48 + 60) }}>
            <Bar
              plugins={[ChartDataLabels]}
              data={{
                labels: byMercado.labels,
                datasets: [{
                  data: byMercado.data,
                  backgroundColor: byMercado.data.map(barColor),
                  borderColor:     byMercado.data.map(barBorder),
                  borderWidth: 2, borderRadius: 4,
                }],
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                layout: { padding: { right: 52 } },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (c: any) => fmtBRL(c.parsed.x ?? 0) } },
                  datalabels: datalabelsH,
                },
                scales: { x: xAxisH, y: yAxisH },
              } as any}
            />
          </div>
        </ChartCard>
      </div>
    </>
  )
}
