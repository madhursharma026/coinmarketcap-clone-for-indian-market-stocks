import CompactHeader from '@/components/Header/CompactHeader/CompactHeader'
import Header from '@/components/Header/MainHeader/Header'
import Header2 from '@/components/Header/SecondaryHeader/Header2'
import StockTable from '@/components/StockTable/StockTable'
import { useTheme } from '@/utils/ThemeContext'
import styles from '../styles/home.module.css'

export default function Home() {
  const { isDarkMode } = useTheme()

  return (
    <div className={isDarkMode ? `${styles.darkMode}` : `${styles.lightMode}`}>
      <div className="d-xxl-block d-none">
        <Header />
        <Header2 />
      </div>
      <CompactHeader />
      <StockTable />
      <br />
      <br />
      <br />
    </div>
  )
}
