import styles from './Header2.module.css'

function Header2() {
  return (
    <div
      className={`${styles.header2} d-flex justify-content-between align-items-center flex-wrap px-3 py-1 border-bottom`}
    >
      <div className={`${styles.stats} d-flex flex-wrap gap-2 fw-medium`}>
        <span>
          Cryptos: <a className="text-primary fw-semibold">17.49M</a>
        </span>
        <span>
          Exchanges: <a className="text-primary fw-semibold">826</a>
        </span>
        <span>
          Market Cap: <a className="text-primary fw-semibold">$3.11T</a>
          <span className={styles.down}>▼ 0.88%</span>
        </span>
        <span>
          24h Vol: <a className="text-primary fw-semibold">$1371.5B</a>
          <span className={styles.up}>▲ 31.80%</span>
        </span>
        <span>
          Dominance:{' '}
          <a className="text-primary fw-semibold">BTC: 64.9% ETH: 8.7%</a>
        </span>
        <span>
          <i className="fa fa-gas-pump" /> ETH Gas:
          <a className="text-primary fw-semibold"> 0.71 Gwei</a>
        </span>
        <span>
          Fear & Greed: <a className="text-primary fw-semibold">37/100</a>
        </span>
      </div>

      <div className={`${styles.actions} d-flex align-items-center gap-2`}>
        <button className={`${styles.getListedBtn} btn btn-light fw-semibold`}>
          Get listed <i className="fa fa-caret-down" />
        </button>
        <button className={`${styles.apiBtn} btn btn-light fw-semibold`}>
          API
        </button>
      </div>
    </div>
  )
}

export default Header2
