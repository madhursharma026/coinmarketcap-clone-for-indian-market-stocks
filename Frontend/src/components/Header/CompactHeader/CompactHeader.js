import { useTheme } from '@/utils/ThemeContext'
import styles from './CompactHeader.module.css'

function CompactHeader() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div
      className={`${styles.compactHeader} d-xxl-none d-flex justify-content-between align-items-center px-3 py-2 border-bottom`}
    >
      <div className="d-flex align-items-center gap-2">
        <img
          src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/coinmarketcap-pqt6lgoh0ghwcrt36d3j79.png/coinmarketcap-agqsbhcdw5syj5e0mnvcli.png?_a=DATAdtAAZAA0"
          alt="CMC"
          height={30}
        />
        <span className={styles.logoText}>CoinMarketCap</span>
        <span className={`${styles.dominance} d-sm-block d-none`}>
          Dominance: <a className="text-primary">BTC: 64.9% ETH: 8.7%</a>
        </span>
      </div>
      <div className="d-flex align-items-center gap-3">
        <i className={`fa fa-search fs-5 ${styles.rightLink}`} />
        <i className={`fa fa-diamond fs-5 ${styles.rightLink}`} />
        <i className={`fa fa-bars fs-5 ${styles.rightLink}`} />

        <button onClick={toggleTheme} className={styles.avatarBtn}>
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </div>
  )
}

export default CompactHeader
