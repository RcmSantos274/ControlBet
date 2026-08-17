'use client'
import Link from 'next/link'
import styles from './landing.module.css'

export default function LandingPage() {

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

      {/* SCREENSHOTS */}
      <section className={styles.screenshots} id="dashboard-preview">
        <p className={styles.screenshotsLabel}>Veja como funciona na prática</p>
        <div className={styles.screenshotsGrid}>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotTag}>Registro de apostas</div>
            <img src="/images/apostas.png" alt="Painel de apostas" className={styles.screenshotImg} />
          </div>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotTag}>Lucro por mercado</div>
            <img src="/images/grafico_lucromercado.png" alt="Gráfico de lucro por mercado" className={styles.screenshotImg} />
          </div>
          <div className={styles.screenshotCard}>
            <div className={styles.screenshotTag}>Desempenho por faixa de odd</div>
            <img src="/images/graficos_faixaodds.png" alt="Gráfico de faixa de odds" className={styles.screenshotImg} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        ◉ &nbsp; controlbet<span>.shop</span>
      </footer>

    </div>
  )
}
