'use client'
import { useMemo } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { useApostas } from '@/hooks/useApostas'
import { fmt, pct, normBet } from '@/lib/utils'
import type { Aposta } from '@/types'
import styles from './analise.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const GC = 'rgba(148,163,184,.10)'
const GC2 = 'rgba(148,163,184,.14)'
const TC = '#e5e7eb'
const C = {
  green: '#00f0a8', greenDark: 'rgba(0,240,168,.55)',
  red: '#ff3b68', redDark: 'rgba(255,59,104,.55)',
  orange: '#f59e0b', orangeDark: 'rgba(245,158,11,.55)',
  blue: '#4d9fff', gray: '#94a3b8',
}

function fmtShort(v: number) {
  if (v === 0) return ''
  const abs = Math.abs(v)
  const sign = v < 0 ? '-' : '+'
  if (abs >= 1000) return `${sign}R$${(abs / 1000).toFixed(1)}k`
  return `${sign}R$${abs.toFixed(0)}`
}
function fmtPct(v: number) { return v === 0 ? '' : `${v.toFixed(1)}%` }

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
const dlPct = {
  anchor: 'end' as const, align: 'start' as const, offset: 4, clip: false,
  color: (ctx: any) => (ctx.dataset.data[ctx.dataIndex] as number) >= 50 ? 'rgba(0,240,168,.9)' : 'rgba(255,59,104,.9)',
  font: { size: 11, weight: 700 as const },
  formatter: (v: number) => fmtPct(v),
}

const legendOpts = {
  labels: { color: '#dbeafe', font: { size: 13, weight: 600 as const }, usePointStyle: true, pointStyle: 'circle' as const, padding: 18 }
}

const xAxis = (currency = false) => ({
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, ...(currency ? { callback: (v: any) => 'R$' + Number(v).toFixed(0) } : {}) },
  grid: { color: GC },
})
const yAxis = (currency = false) => ({
  ticks: { color: TC, font: { size: 13, weight: 700 as const }, ...(currency ? { callback: (v: any) => 'R$' + Number(v).toFixed(0) } : {}) },
  grid: { color: GC2 },
})

const RESULTADO_FINAL_SET = new Set(['Casa','Fora','DC Casa','DC Fora','Empate Anula'])
const GOLS_SET = new Set(['Over 0.5','Over 1.5','Over 2.5','Over 3.5','Under 0.5','Under 1.5','Under 2.5','Under 3.5','Ambas Marcam (BTTS)','Ambas Não Marcam','Ambas Marcam ou +2.5'])
const CARTOES_SET = new Set(['Over Cartões','Under Cartões','Ambas Recebem Cartão','Jogador Cartão'])
const PERIODO_SET = new Set(['Vitória 1º Tempo','Vitória 2º Tempo'])

function getMercadoGrupo(m: string): string {
  if (RESULTADO_FINAL_SET.has(m)) return 'Resultado Final'
  if (GOLS_SET.has(m)) return 'Gols'
  if (m.startsWith('HA')) return 'Handicap Asiático'
  if (CARTOES_SET.has(m)) return 'Cartões'
  if (PERIODO_SET.has(m)) return 'Período'
  return m
}
const ODD_RANGES = [
  { label: '1.00–1.20', min: 1.00, max: 1.20 },
  { label: '1.21–1.40', min: 1.21, max: 1.40 },
  { label: '1.41–1.60', min: 1.41, max: 1.60 },
  { label: '1.61–1.80', min: 1.61, max: 1.80 },
  { label: '1.81–2.00', min: 1.81, max: 2.00 },
  { label: '2.01–3.00', min: 2.01, max: 3.00 },
  { label: '3.01+',     min: 3.01, max: Infinity },
]

function norm(b: Aposta) { return normBet(b) }

function SectionHeader({ title }: { title: string }) {
  return <div className={styles.sectionHeader}><span/><h2>{title}</h2></div>
}

function ChartCard({ icon, title, subtitle, children, large = false }: { icon: string; title: string; subtitle: string; children: React.ReactNode; large?: boolean }) {
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

export default function AnaliseClient({ sport = 'futebol' }: { sport?: string }) {
  const { apostas } = useApostas(sport)

  const resolved = apostas.filter(b => b.resultado !== 'pendente')
  const winners = apostas.filter(b => b.resultado === 'ganhou' || b.resultado === 'cash')
  const totalAp = apostas.reduce((s, b) => s + b.valor, 0)
  const totalRet = winners.reduce((s, b) => s + norm(b).retorno, 0)
  const lucroT = totalRet - resolved.reduce((s, b) => s + b.valor, 0)
  const winRate = resolved.length ? winners.length / resolved.length * 100 : 0

  type MStats = { mercado: string; lucro: number; volume: number; count: number; ganhou: number; perdeu: number; cash: number; pendente: number }

  const mercadoStats = useMemo((): MStats[] => {
    const map: Record<string, { ret: number; valRes: number; volume: number; count: number; ganhou: number; perdeu: number; cash: number; pendente: number }> = {}
    apostas.forEach(b => {
      if (!map[b.mercado]) map[b.mercado] = { ret: 0, valRes: 0, volume: 0, count: 0, ganhou: 0, perdeu: 0, cash: 0, pendente: 0 }
      const g = map[b.mercado]
      g.volume += b.valor; g.count++
      if (b.resultado === 'ganhou')  { g.ganhou++; g.ret += norm(b).retorno; g.valRes += b.valor }
      else if (b.resultado === 'perdeu') { g.perdeu++; g.valRes += b.valor }
      else if (b.resultado === 'cash')   { g.cash++;   g.ret += norm(b).retorno; g.valRes += b.valor }
      else g.pendente++
    })
    return Object.entries(map).map(([mercado, s]) => ({ mercado, volume: s.volume, count: s.count, ganhou: s.ganhou, perdeu: s.perdeu, cash: s.cash, pendente: s.pendente, lucro: s.ret - s.valRes }))
  }, [apostas])

  const mercadoGrupoStats = useMemo(() => {
    const map: Record<string, { ret: number; valRes: number; volume: number; count: number; ganhou: number; perdeu: number; cash: number; pendente: number }> = {}
    apostas.forEach(b => {
      const grupo = getMercadoGrupo(b.mercado)
      if (!map[grupo]) map[grupo] = { ret: 0, valRes: 0, volume: 0, count: 0, ganhou: 0, perdeu: 0, cash: 0, pendente: 0 }
      const g = map[grupo]
      g.volume += b.valor; g.count++
      if (b.resultado === 'ganhou')  { g.ganhou++; g.ret += norm(b).retorno; g.valRes += b.valor }
      else if (b.resultado === 'perdeu') { g.perdeu++; g.valRes += b.valor }
      else if (b.resultado === 'cash')   { g.cash++;   g.ret += norm(b).retorno; g.valRes += b.valor }
      else g.pendente++
    })
    return Object.entries(map)
      .map(([label, s]) => ({ label, volume: s.volume, count: s.count, ganhou: s.ganhou, perdeu: s.perdeu, cash: s.cash, pendente: s.pendente, lucro: s.ret - s.valRes }))
      .sort((a, b) => b.lucro - a.lucro)
  }, [apostas])

  const oddStats = useMemo(() => ODD_RANGES.map(r => {
    const bets = apostas.filter(b => b.odd >= r.min && b.odd <= r.max)
    const res = bets.filter(b => b.resultado !== 'pendente')
    const won = bets.filter(b => b.resultado==='ganhou'||b.resultado==='cash')
    const lucro = won.reduce((s,b)=>s+norm(b).retorno,0) - res.reduce((s,b)=>s+b.valor,0)
    const winR = res.length ? won.length/res.length*100 : 0
    return { label: r.label, total: bets.length, ganhou: bets.filter(b=>b.resultado==='ganhou').length,
      perdeu: bets.filter(b=>b.resultado==='perdeu').length, cash: bets.filter(b=>b.resultado==='cash').length,
      pendente: bets.filter(b=>b.resultado==='pendente').length, lucro, winRate: winR }
  }), [apostas])

  const lucroDiaData = useMemo(() => {
    const byDay: Record<string, number> = {}
    apostas.filter(b => b.resultado !== 'pendente' && b.data).forEach(b => {
      const d = b.data.slice(0, 10)
      byDay[d] = (byDay[d] || 0) + norm(b).lucro
    })
    const sorted = Object.keys(byDay).sort()
    return {
      labels: sorted.map(d => { const [y,m,dd] = d.split('-'); return `${dd}/${m}/${y.slice(2)}` }),
      values: sorted.map(d => parseFloat(byDay[d].toFixed(2))),
    }
  }, [apostas])

  const sitStats = useMemo(() => ['pre','ao-vivo'].map(sit => {
    const label = sit==='pre'?'Pré Live':'Ao Vivo'
    const bets = apostas.filter(b=>b.situacao===sit)
    const res = bets.filter(b=>b.resultado!=='pendente')
    const won = bets.filter(b=>b.resultado==='ganhou'||b.resultado==='cash')
    const lucro = won.reduce((s,b)=>s+norm(b).retorno,0)-res.reduce((s,b)=>s+b.valor,0)
    return { label, total: bets.length, ganhou: bets.filter(b=>b.resultado==='ganhou').length,
      perdeu: bets.filter(b=>b.resultado==='perdeu').length, cash: bets.filter(b=>b.resultado==='cash').length,
      pendente: bets.filter(b=>b.resultado==='pendente').length, lucro,
      winRate: res.length?won.length/res.length*100:0, resolved: res.length }
  }), [apostas])

  const lucroEvoData = useMemo(() => {
    const sorted = [...apostas].sort((a,b)=>new Date(a.data||0).getTime()-new Date(b.data||0).getTime())
    let acc = 0; const labels: string[] = []; const data: number[] = []
    sorted.forEach(b => {
      if (b.resultado!=='pendente') acc+=norm(b).lucro
      labels.push(new Date(b.data||Date.now()).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}))
      data.push(parseFloat(acc.toFixed(2)))
    })
    return { labels, data }
  }, [apostas])

  if (!apostas.length) {
    return (
      <main className={styles.main}>
        <div className="empty-state"><div className="icon">📊</div><div>Nenhuma aposta registrada ainda.</div></div>
      </main>
    )
  }

  const mLucroSorted = [...mercadoStats].sort((a,b)=>(b as any).lucro-(a as any).lucro)
  const mCountSorted = [...mercadoStats].sort((a,b)=>(b as any).count-(a as any).count)

  return (
    <main className={styles.main}>
      {/* Summary cards */}
      <div className={styles.cards}>
        <div className="card"><div className="card-label">Total Apostado</div><div className="card-value blue">{fmt(totalAp)}</div></div>
        <div className="card"><div className="card-label">Total Retornos</div><div className="card-value">{fmt(totalRet)}</div></div>
        <div className="card"><div className="card-label">Lucro Líquido</div><div className={`card-value ${lucroT>=0?'green':'red'}`}>{fmt(lucroT)}</div></div>
        <div className="card"><div className="card-label">Apostas Resolvidas</div><div className="card-value">{resolved.length}</div></div>
        <div className="card"><div className="card-label">Cash Outs</div><div className="card-value orange">{apostas.filter(b=>b.resultado==='cash').length}</div></div>
        <div className="card"><div className="card-label">Taxa de Acerto</div><div className={`card-value ${winRate>=50?'green':'red'}`}>{pct(winRate)}</div></div>
      </div>

      {/* MERCADO */}
      <SectionHeader title="Desempenho por Mercado"/>
      <ChartCard icon="↗" title="Lucro / Prejuízo por Mercado" subtitle="Lucro agrupado por categoria: Resultado Final, Gols, Handicap Asiático, Cartões, Período e mercados individuais." large>
        <div className={styles.chartWrap} style={{ height: Math.max(280, mercadoGrupoStats.length*34+60) }}>
          <Bar plugins={[ChartDataLabels]} data={{ labels: mercadoGrupoStats.map(s=>s.label), datasets: [{ data: mercadoGrupoStats.map(s=>s.lucro), backgroundColor: mercadoGrupoStats.map(s=>s.lucro>=0?C.greenDark:C.redDark), borderColor: mercadoGrupoStats.map(s=>s.lucro>=0?C.green:C.red), borderWidth: 2, borderRadius: 4 }] }}
            options={{ responsive:true,maintainAspectRatio:false,indexAxis:'y',layout:{padding:{right:52}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.x??0)}},datalabels:dlH},scales:{x:xAxis(true),y:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}}}}}/>
        </div>
      </ChartCard>

      <ChartCard icon="↗" title="Lucro / Prejuízo por Mercado Específico" subtitle="Lucro líquido por mercado individual, incluindo cash outs nos cálculos." large>
        <div className={styles.chartWrap} style={{ height: Math.max(280, mLucroSorted.length*30+60) }}>
          <Bar plugins={[ChartDataLabels]} data={{ labels: mLucroSorted.map((s:any)=>s.mercado), datasets: [{ data: mLucroSorted.map((s:any)=>s.lucro), backgroundColor: mLucroSorted.map((s:any)=>s.lucro>=0?C.greenDark:C.redDark), borderColor: mLucroSorted.map((s:any)=>s.lucro>=0?C.green:C.red), borderWidth: 2, borderRadius: 4 }] }}
            options={{ responsive:true,maintainAspectRatio:false,indexAxis:'y',layout:{padding:{right:52}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.x??0)}},datalabels:dlH},scales:{x:xAxis(true),y:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}}}}}/>
        </div>
      </ChartCard>

      <ChartCard icon="▦" title="Entradas por Mercado — Green · Red · Cash" subtitle="Distribuição dos resultados agrupados por mercado." large>
        <div className={styles.chartWrap} style={{ height: Math.max(280, mCountSorted.length*30+60) }}>
          <Bar data={{ labels: mCountSorted.map((s:any)=>s.mercado), datasets: [
            { label:'🟢 Green',    data: mCountSorted.map((s:any)=>s.ganhou),   backgroundColor:C.greenDark,  borderColor:C.green,  borderWidth:2,borderRadius:4 },
            { label:'🔴 Red',      data: mCountSorted.map((s:any)=>s.perdeu),   backgroundColor:C.redDark,    borderColor:C.red,    borderWidth:2,borderRadius:4 },
            { label:'🟠 Cash',     data: mCountSorted.map((s:any)=>s.cash),     backgroundColor:C.orangeDark, borderColor:C.orange, borderWidth:2,borderRadius:4 },
            { label:'⏳ Pendente', data: mCountSorted.map((s:any)=>s.pendente), backgroundColor:'rgba(245,158,11,.2)',borderColor:C.orange,borderWidth:1,borderRadius:4 },
          ]}}
            options={{ responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{...legendOpts,display:true,position:'top'}},scales:{x:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}}}}}/>
        </div>
      </ChartCard>

      <div className={styles.grid2}>
        <ChartCard icon="$" title="Volume Apostado por Mercado (R$)" subtitle="Total apostado em cada mercado.">
          <div className={styles.chartWrap} style={{ height: Math.max(220, mCountSorted.length*30+60) }}>
            <Bar data={{ labels: [...mCountSorted].sort((a:any,b:any)=>b.volume-a.volume).map((s:any)=>s.mercado), datasets:[{data:[...mCountSorted].sort((a:any,b:any)=>b.volume-a.volume).map((s:any)=>s.volume),backgroundColor:'rgba(77,159,255,.45)',borderColor:C.blue,borderWidth:2,borderRadius:4}]}}
              options={{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.x??0)}}},scales:{x:xAxis(true),y:{ticks:{color:TC,font:{size:12,weight:700}},grid:{color:GC}}}}}/>
          </div>
        </ChartCard>
        <ChartCard icon="◈" title="Contagem de Apostas por Mercado" subtitle="Número de apostas registradas em cada mercado.">
          <div className={styles.chartWrap} style={{ height: Math.max(220, mCountSorted.length*30+60) }}>
            <Bar data={{ labels: mCountSorted.map((s:any)=>s.mercado), datasets:[{data:mCountSorted.map((s:any)=>s.count),backgroundColor:'rgba(168,85,247,.45)',borderColor:'#a855f7',borderWidth:2,borderRadius:4}]}}
              options={{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.x??0} apostas`}}},scales:{x:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}},y:{ticks:{color:TC,font:{size:12,weight:700}},grid:{color:GC}}}}}/>
          </div>
        </ChartCard>
      </div>

      {/* LUCRO POR DIA */}
      <SectionHeader title="Lucro / Prejuízo por Dia"/>
      <ChartCard icon="▦" title="Resultado Diário (R$)" subtitle="Lucro ou prejuízo acumulado por dia de apostas." large>
        <div className={styles.chartWrap} style={{ height: Math.max(280, lucroDiaData.labels.length*38+60) }}>
          <Bar plugins={[ChartDataLabels]} data={{ labels: lucroDiaData.labels, datasets:[{ data:lucroDiaData.values, backgroundColor:lucroDiaData.values.map(v=>v>=0?C.greenDark:C.redDark), borderColor:lucroDiaData.values.map(v=>v>=0?C.green:C.red),borderWidth:2,borderRadius:5}]}}
            options={{responsive:true,maintainAspectRatio:false,layout:{padding:{top:22}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y??0),afterLabel:(_c,i=0)=>lucroDiaData.values[i]>=0?'✅ Dia positivo':'❌ Dia negativo'}},datalabels:dlV},scales:{x:xAxis(),y:yAxis(true)}}}/>
        </div>
      </ChartCard>

      {/* PRÉ LIVE VS AO VIVO */}
      <SectionHeader title="Pré Live vs Ao Vivo"/>
      <div className={styles.grid2}>
        <ChartCard icon="〽" title="Entradas - Green / Red / Cash / Taxa de Acerto" subtitle="Comparativo de entradas e taxa de acerto entre pré live e ao vivo.">
          <div className={styles.chartWrap} style={{ height: 320 }}>
            <Bar data={{ labels: sitStats.map(s=>s.label), datasets:[
              {label:'🟢 Green',    data:sitStats.map(s=>s.ganhou),   backgroundColor:C.greenDark,  borderColor:C.green,  borderWidth:2,borderRadius:5},
              {label:'🔴 Red',      data:sitStats.map(s=>s.perdeu),   backgroundColor:C.redDark,    borderColor:C.red,    borderWidth:2,borderRadius:5},
              {label:'🟠 Cash Out', data:sitStats.map(s=>s.cash),     backgroundColor:C.orangeDark, borderColor:C.orange, borderWidth:2,borderRadius:5},
              {label:'⏳ Pendente', data:sitStats.map(s=>s.pendente), backgroundColor:'rgba(245,158,11,.2)',borderColor:C.orange,borderWidth:1,borderRadius:5},
            ]}}
              options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{...legendOpts,display:true,position:'top'},tooltip:{mode:'index',callbacks:{title:items=>`${sitStats[items[0].dataIndex].label}  —  ${sitStats[items[0].dataIndex].total} entradas`,afterBody:items=>[`─────────────────`,`Taxa de acerto: ${sitStats[items[0].dataIndex].winRate.toFixed(1)}%`]}}},scales:{x:xAxis(),y:{ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC2},beginAtZero:true}}}}/>
          </div>
        </ChartCard>
        <ChartCard icon="$" title="Lucro / Prejuízo por Situação (R$)" subtitle="Lucro líquido obtido em cada situação de entrada.">
          <div className={styles.chartWrap} style={{ height: 320 }}>
            <Bar plugins={[ChartDataLabels]} data={{ labels: sitStats.map(s=>s.label), datasets:[{label:'Lucro Líquido',data:sitStats.map(s=>parseFloat(s.lucro.toFixed(2))),backgroundColor:sitStats.map(s=>s.lucro>=0?C.greenDark:C.redDark),borderColor:sitStats.map(s=>s.lucro>=0?C.green:C.red),borderWidth:3,borderRadius:8,barThickness:80}]}}
              options={{responsive:true,maintainAspectRatio:false,layout:{padding:{top:22}},plugins:{legend:{display:false},tooltip:{callbacks:{title:items=>sitStats[items[0].dataIndex].label,label:c=>`Lucro: ${fmt(c.parsed.y??0)}`}},datalabels:dlV},scales:{x:xAxis(),y:yAxis(true)}}}/>
          </div>
        </ChartCard>
      </div>

      {/* RESULTADOS GERAIS */}
      <SectionHeader title="Resultados Gerais"/>
      <div className={styles.grid2}>
        <ChartCard icon="◉" title="Distribuição de Resultados" subtitle="Proporção de greens, reds, cash outs e pendentes.">
          <div className={styles.chartWrap} style={{ height: 280 }}>
            <Doughnut data={{ labels:['Ganhou','Perdeu','Cash Out','Pendente'], datasets:[{data:[apostas.filter(b=>b.resultado==='ganhou').length,apostas.filter(b=>b.resultado==='perdeu').length,apostas.filter(b=>b.resultado==='cash').length,apostas.filter(b=>b.resultado==='pendente').length],backgroundColor:[C.greenDark,C.redDark,C.orangeDark,'rgba(148,163,184,.45)'],borderColor:[C.green,C.red,C.orange,C.gray],borderWidth:2}]}}
              options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{...legendOpts,display:true,position:'bottom'}}}}/>
          </div>
        </ChartCard>
        <ChartCard icon="↗" title="Evolução do Lucro Acumulado" subtitle="Crescimento do lucro ao longo de todas as apostas.">
          <div className={styles.chartWrap} style={{ height: 280 }}>
            <Line data={{ labels:lucroEvoData.labels, datasets:[{data:lucroEvoData.data,borderColor:C.green,backgroundColor:'rgba(0,240,168,.12)',fill:true,tension:0.35,pointRadius:3,pointBackgroundColor:C.green}]}}
              options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y??0)}}},scales:{x:xAxis(),y:yAxis(true)}}}/>
          </div>
        </ChartCard>
      </div>

      {/* FAIXAS DE ODD */}
      <SectionHeader title="Análise por Faixa de Odd"/>
      <ChartCard icon="↗" title="Resultados por Faixa de Odd" subtitle="Distribuição dos resultados de acordo com as faixas de odd." large>
        <div className={styles.chartWrap} style={{ height: 300 }}>
          <Bar data={{ labels:oddStats.map(s=>s.label), datasets:[
            {label:'Ganhou',   data:oddStats.map(s=>s.ganhou),   backgroundColor:C.greenDark,  borderColor:C.green,  borderWidth:1,borderRadius:3},
            {label:'Cash Out', data:oddStats.map(s=>s.cash),     backgroundColor:C.orangeDark, borderColor:C.orange, borderWidth:1,borderRadius:3},
            {label:'Perdeu',   data:oddStats.map(s=>s.perdeu),   backgroundColor:C.redDark,    borderColor:C.red,    borderWidth:1,borderRadius:3},
            {label:'Pendente', data:oddStats.map(s=>s.pendente), backgroundColor:'rgba(148,163,184,.25)',borderColor:C.gray,borderWidth:1,borderRadius:3},
          ]}}
            options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{...legendOpts,display:true,position:'top'},tooltip:{mode:'index',callbacks:{afterTitle:items=>`Total: ${items.reduce((s,i)=>s+(i.parsed.y??0),0)}`}}},scales:{x:{stacked:true,ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC}},y:{stacked:true,ticks:{color:TC,font:{size:13,weight:700}},grid:{color:GC2}}}}}/>
        </div>
      </ChartCard>

      <div className={styles.grid2}>
        <ChartCard icon="$" title="Lucro / Prejuízo por Faixa de Odd" subtitle="Lucro líquido obtido em cada faixa de odd.">
          <div className={styles.chartWrap} style={{ height: 260 }}>
            <Bar plugins={[ChartDataLabels]} data={{ labels:oddStats.map(s=>s.label), datasets:[{data:oddStats.map(s=>parseFloat(s.lucro.toFixed(2))),backgroundColor:oddStats.map(s=>s.lucro>=0?C.greenDark:C.redDark),borderColor:oddStats.map(s=>s.lucro>=0?C.green:C.red),borderWidth:2,borderRadius:5}]}}
              options={{responsive:true,maintainAspectRatio:false,layout:{padding:{top:22}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fmt(c.parsed.y??0)}},datalabels:dlV},scales:{x:xAxis(),y:yAxis(true)}}}/>
          </div>
        </ChartCard>
        <ChartCard icon="◎" title="Taxa de Acerto por Faixa de Odd (%)" subtitle="Percentual de acerto em cada faixa de odd.">
          <div className={styles.chartWrap} style={{ height: 260 }}>
            <Bar plugins={[ChartDataLabels]} data={{ labels:oddStats.map(s=>s.label), datasets:[{data:oddStats.map(s=>parseFloat(s.winRate.toFixed(1))),backgroundColor:oddStats.map(s=>s.winRate>=50?C.greenDark:C.redDark),borderColor:oddStats.map(s=>s.winRate>=50?C.green:C.red),borderWidth:2,borderRadius:5}]}}
              options={{responsive:true,maintainAspectRatio:false,layout:{padding:{top:22}},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>pct(c.parsed.y??0)}},datalabels:dlPct},scales:{x:xAxis(),y:{ticks:{color:TC,font:{size:13,weight:700},callback:(v:any)=>v+'%'},grid:{color:GC2},min:0,max:100}}}}/>
          </div>
        </ChartCard>
      </div>
    </main>
  )
}
