import { useTheme } from '@/utils/ThemeContext'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import styles from './Header.module.css'

function Header() {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <Navbar expand="xxl" className={styles.navbar}>
      <Container fluid>
        <Navbar.Brand href="#" className={styles.logo}>
          <img
            src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/logos/coinmarketcap-pqt6lgoh0ghwcrt36d3j79.png/coinmarketcap-agqsbhcdw5syj5e0mnvcli.png?_a=DATAdtAAZAA0"
            alt="CoinMarketCap"
            height={30}
          />
          <span className={styles.logoText}>CoinMarketCap</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbarScroll" />

        <Navbar.Collapse id="navbarScroll">
          <Nav className={`${styles.navLinks} me-auto`}>
            <Nav.Link href="#">Cryptocurrencies</Nav.Link>
            <Nav.Link href="#">DexScan</Nav.Link>
            <Nav.Link href="#">Exchanges</Nav.Link>
            <Nav.Link href="#">Community</Nav.Link>
            <Nav.Link href="#">Products</Nav.Link>
            <Nav.Link href="#">CMC Launch</Nav.Link>
          </Nav>

          <div className={styles.rightSection}>
            <Nav.Link className={styles.rightLink}>
              <i className="fa fa-pie-chart" />
              Portfolio
            </Nav.Link>

            <Nav.Link className={styles.rightLink}>
              <i className="fa fa-star" />
              Watchlist
            </Nav.Link>

            <Form className={styles.searchForm}>
              <Form.Control type="search" placeholder="Search" />
            </Form>

            <div className={styles.qrContainer}>
              <i className="fa fa-qrcode" />
            </div>

            <button type="button" className={styles.avatarBtn}>
              <i className="fa fa-bars" />
              &ensp;
              <i className="fa fa-user" />
            </button>

            <button onClick={toggleTheme} className={styles.avatarBtn}>
              {isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header
