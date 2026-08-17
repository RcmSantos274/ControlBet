'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (r.ok) router.replace('/apostas')
    }).catch(() => {})
  }, [router])

  function scrollToDash() {
    document.getElementById('dashboard-preview')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.page}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon} />
          Control<span className={styles.logoGreen}>Bet</span>
        </div>
        <Link href="/login" className={styles.loginBtn}>↪ &nbsp;Entrar</Link>
      </header>

      {/* HERO */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Controle total<br />
          das suas <span>apostas</span>
        </h1>
        <p className={styles.heroSub}>Registre, analise e evolua com dados reais</p>
        <div className={styles.heroButtons}>
          <Link href="/cadastro" className={styles.btnPrimary}>Começar grátis &nbsp;→</Link>
          <button className={styles.btnSecondary} onClick={scrollToDash}>◉ &nbsp;Ver demonstração</button>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>▣</div>
          <div>
            <h3>Registre suas apostas</h3>
            <p>Cadastre todas as suas apostas em segundos e tenha tudo organizado em um só lugar.</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>⌁</div>
          <div>
            <h3>Analise seus resultados</h3>
            <p>Acompanhe lucro, ROI, taxa de acerto e desempenho por mercado.</p>
          </div>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>↗</div>
          <div>
            <h3>Evolua com dados</h3>
            <p>Descubra padrões, identifique o que funciona e aumente seu lucro com consistência.</p>
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section className={styles.dashboard} id="dashboard-preview">

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.dashLogo}>◉ Control<span className={styles.dashLogoGreen}>Bet</span></div>
          <div className={styles.menu}>
            {['▣  Resumo','▤  Apostas','◫  Análises','◌  Mercados','▧  Relatórios','◇  Metas','◈  Bankroll','⚙  Configurações'].map((item, i) => (
              <div key={i} className={`${styles.menuItem} ${i === 0 ? styles.active : ''}`}>{item}</div>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <main className={styles.dashboardContent}>
          <div className={styles.dashTop}>
            <div className={styles.filter}>01/05/2024 — 31/05/2024</div>
            <div className={styles.filter}>⚱ Filtros</div>
          </div>

          {/* METRICS */}
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Lucro líquido</div>
              <div className={styles.metricValue}>R$ 12.458,75</div>
              <div className={styles.metricChange}>↑ 18,6% vs período anterior</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>ROI</div>
              <div className={styles.metricValue}>18,47%</div>
              <div className={styles.metricChange}>↑ 3,2% vs período anterior</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Taxa de acerto</div>
              <div className={styles.metricValue}>61,68%</div>
              <div className={styles.metricChange}>↑ 7,8% vs período anterior</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricLabel}>Número de apostas</div>
              <div className={styles.metricValue}>428</div>
              <div className={styles.metricChange}>↑ 56 vs período anterior</div>
            </div>
          </div>

          {/* PANELS */}
          <div className={styles.dashGrid}>

            {/* CHART */}
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Evolução do lucro</div>
              <div className={styles.chart}>
                <div className={styles.chartLines} />
                <svg className={styles.chartSvg} viewBox="0 0 600 170" preserveAspectRatio="none">
                  <path fill="none" stroke="#00f0a8" strokeWidth="3"
                    d="M0,150 L25,142 L50,147 L75,130 L100,135 L125,118 L150,120 L175,108 L200,111 L225,92 L250,99 L275,78 L300,86 L325,67 L350,72 L375,53 L400,62 L425,42 L450,48 L475,35 L500,42 L525,27 L550,34 L575,18 L600,10"/>
                </svg>
              </div>
            </div>

            {/* DONUT */}
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Taxa de acerto por mercado</div>
              <div className={styles.donutArea}>
                <div className={styles.donut}>
                  <div className={styles.donutInner}>61,68%</div>
                </div>
                <div className={styles.legend}>
                  {['Over/Under — 64,29%','Ambas Marcam — 62,11%','Resultado Final — 58,79%','Handicap Asiático — 57,14%','Escanteios — 55,56%','Cartões — 50,00%'].map((item, i) => (
                    <div key={i} className={styles.legendItem}>
                      <div className={styles.dot} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TABLE */}
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Últimas apostas</div>
              <table className={styles.betsTable}>
                <thead>
                  <tr>
                    <th>DATA</th><th>EVENTO</th><th>MERCADO</th><th>ODD</th><th>STAKE</th><th>RESULTADO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>17/05</td><td>Flamengo x Palmeiras</td><td>Over 2.5</td><td>1.87</td><td>R$200</td><td className={styles.win}>R$174</td></tr>
                  <tr><td>17/05</td><td>City x Arsenal</td><td>Ambos Marcam</td><td>1.70</td><td>R$150</td><td className={styles.win}>R$105</td></tr>
                  <tr><td>16/05</td><td>Real Madrid x Milan</td><td>Handicap</td><td>1.95</td><td>R$200</td><td className={styles.loss}>-R$200</td></tr>
                  <tr><td>16/05</td><td>Bayern x PSG</td><td>Over 3.5</td><td>2.10</td><td>R$150</td><td className={styles.win}>R$165</td></tr>
                  <tr><td>15/05</td><td>Liverpool x Atalanta</td><td>Resultado</td><td>1.60</td><td>R$100</td><td className={styles.win}>R$160</td></tr>
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        ◉ &nbsp; controlbet<span>.shop</span>
      </footer>

    </div>
  )
}
