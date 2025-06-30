'use client'

import { useTheme } from '@/utils/ThemeContext'
import { useEffect, useState } from 'react'
import { Alert, Pagination, Spinner, Table } from 'react-bootstrap'
import styles from './StockTable.module.css'

const format = (num) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num)

const ITEMS_PER_PAGE = 50

export default function StockTable() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ pe: '', roe: '' })

  const defaultCols = {
    'f.pe_ratio': true,
    'f.roe': true,
    'f.pb_ratio': true,
    'f.roce': true,
    'f.debt_to_equity': true,
    'f.dividend_yield': true,
    'f.sales_growth_3yr': true,
    'f.profit_growth_3yr': true,
    'f.sales_growth_5yr': true,
    'f.profit_growth_5yr': true,
    'p.high_52w': true,
    'p.low_52w': true,
  }

  const [visibleCols, setVisibleCols] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('visibleCols')) || defaultCols
    }
    return defaultCols
  })

  const toggleColumn = (key) => {
    const updated = { ...visibleCols, [key]: !visibleCols[key] }
    setVisibleCols(updated)
    localStorage.setItem('visibleCols', JSON.stringify(updated))
  }

  const { isDarkMode } = useTheme()

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch company data')
        return res.json()
      })
      .then((data) => {
        setStocks(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError(err.message || 'Failed to load stock data')
        setLoading(false)
      })
  }, [])

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortField) return 0

    const getValue = (company) => {
      if (sortField.startsWith('f.'))
        return company.fundamentals?.[sortField.slice(2)]
      if (sortField.startsWith('p.'))
        return company.prices?.[0]?.[sortField.slice(2)]
      return company[sortField]
    }

    const valA = getValue(a)
    const valB = getValue(b)

    if (valA == null) return 1
    if (valB == null) return -1

    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    }

    return sortDirection === 'asc' ? valA - valB : valB - valA
  })

  const filteredStocks = sortedStocks.filter((company) => {
    const f = company.fundamentals || {}
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPE =
      !filters.pe || (f.pe_ratio != null && f.pe_ratio <= Number(filters.pe))
    const matchesROE =
      !filters.roe || (f.roe != null && f.roe >= Number(filters.roe))
    return matchesSearch && matchesPE && matchesROE
  })

  const totalPages = Math.ceil(filteredStocks.length / ITEMS_PER_PAGE)
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) setCurrentPage(pageNum)
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`d-flex flex-column ${
          isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'
        }`}
        style={{ minHeight: '50vh' }}
      >
        <div className="flex-fill d-flex justify-content-center align-items-center">
          <Alert
            variant={isDarkMode ? 'dark' : 'danger'}
            className="text-center p-4 w-75"
          >
            <h4>Something went wrong!</h4>
            <p className="mb-0">{error}</p>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh' }}>
      <div className="row m-2">
        <div className="col-sm-3 mt-2">
          <input
            type="text"
            placeholder="Search company or symbol..."
            className={`form-control w-100 ${styles.searchForm}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-sm-3 mt-2">
          <input
            type="number"
            placeholder="Max P/E"
            className={`form-control w-100 ${styles.searchForm}`}
            value={filters.pe}
            onChange={(e) => setFilters({ ...filters, pe: e.target.value })}
          />
        </div>
        <div className="col-sm-3 mt-2">
          <input
            type="number"
            placeholder="Min ROE"
            className={`form-control w-100 ${styles.searchForm}`}
            value={filters.roe}
            onChange={(e) => setFilters({ ...filters, roe: e.target.value })}
          />
        </div>
        <div className="col-sm-3 mt-2">
          <button
            className="btn btn-sm btn-outline-secondary w-100"
            onClick={() => {
              setSearchQuery('')
              setFilters({ pe: '', roe: '' })
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mx-3 mt-3 gap-3">
        <div className="d-flex flex-wrap gap-2">
          {Object.entries(defaultCols).map(([key]) => (
            <label
              key={key}
              className={`form-check-label me-2 ${styles.textColor}`}
            >
              <input
                type="checkbox"
                className="form-check-input me-1"
                checked={visibleCols[key]}
                onChange={() => toggleColumn(key)}
              />
              {key.replace(/^f\.|p\./, '').toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <Table
        className={`table-borderless align-middle p-3 ${styles.cleanTable} ${
          isDarkMode ? styles.darkTable : ''
        }`}
      >
        <thead
          className={`${styles.tableHeader} ${
            isDarkMode ? styles.darkTableHeader : ''
          }`}
        >
          <tr>
            <th>#</th>
            <th
              className={`${styles.textColor} text-start fw-bold`}
              onClick={() => handleSort('name')}
              style={{ cursor: 'pointer' }}
            >
              Company{' '}
              {sortField === 'name'
                ? sortDirection === 'asc'
                  ? '▲'
                  : '▼'
                : ''}
            </th>
            <th
              className={`${styles.textColor} text-end fw-bold`}
              onClick={() => handleSort('symbol')}
              style={{ cursor: 'pointer' }}
            >
              Symbol{' '}
              {sortField === 'symbol'
                ? sortDirection === 'asc'
                  ? '▲'
                  : '▼'
                : ''}
            </th>
            <th
              className={`${styles.textColor} text-end fw-bold`}
              onClick={() => handleSort('p.current_price')}
              style={{ cursor: 'pointer' }}
            >
              Price{' '}
              {sortField === 'p.current_price'
                ? sortDirection === 'asc'
                  ? '▲'
                  : '▼'
                : ''}
            </th>

            {visibleCols['f.pe_ratio'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.pe_ratio')}
                style={{ cursor: 'pointer' }}
              >
                P/E{' '}
                {sortField === 'f.pe_ratio'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.roe'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.roe')}
                style={{ cursor: 'pointer' }}
              >
                ROE{' '}
                {sortField === 'f.roe'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.pb_ratio'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.pb_ratio')}
                style={{ cursor: 'pointer' }}
              >
                P/B{' '}
                {sortField === 'f.pb_ratio'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.roce'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.roce')}
                style={{ cursor: 'pointer' }}
              >
                ROCE{' '}
                {sortField === 'f.roce'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.debt_to_equity'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.debt_to_equity')}
                style={{ cursor: 'pointer' }}
              >
                D/E Ratio{' '}
                {sortField === 'f.debt_to_equity'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.dividend_yield'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.dividend_yield')}
                style={{ cursor: 'pointer' }}
              >
                Div Yield{' '}
                {sortField === 'f.dividend_yield'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.sales_growth_3yr'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.sales_growth_3yr')}
                style={{ cursor: 'pointer' }}
              >
                Sales Gr 3Y{' '}
                {sortField === 'f.sales_growth_3yr'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.profit_growth_3yr'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.profit_growth_3yr')}
                style={{ cursor: 'pointer' }}
              >
                Profit Gr 3Y{' '}
                {sortField === 'f.profit_growth_3yr'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.sales_growth_5yr'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.sales_growth_5yr')}
                style={{ cursor: 'pointer' }}
              >
                Sales Gr 5Y{' '}
                {sortField === 'f.sales_growth_5yr'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['f.profit_growth_5yr'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('f.profit_growth_5yr')}
                style={{ cursor: 'pointer' }}
              >
                Profit Gr 5Y{' '}
                {sortField === 'f.profit_growth_5yr'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['p.high_52w'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('p.high_52w')}
                style={{ cursor: 'pointer' }}
              >
                52W High{' '}
                {sortField === 'p.high_52w'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
            {visibleCols['p.low_52w'] && (
              <th
                className={`${styles.textColor} text-end fw-bold`}
                onClick={() => handleSort('p.low_52w')}
                style={{ cursor: 'pointer' }}
              >
                52W Low{' '}
                {sortField === 'p.low_52w'
                  ? sortDirection === 'asc'
                    ? '▲'
                    : '▼'
                  : ''}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {paginatedStocks.map((company, index) => {
            const f = company.fundamentals || {}
            const p = company.prices?.[0] || {}

            return (
              <tr key={company.id} className={styles.tableRow}>
                <td className={styles.textColor}>
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>
                <td className={`${styles.textColor} text-start`}>
                  {company.name}
                </td>
                <td className={`text-end ${styles.textColor}`}>
                  {company.symbol}
                </td>
                <td className={`text-end ${styles.textColor}`}>
                  {p.current_price ? `₹${format(p.current_price)}` : '—'}
                </td>

                {visibleCols['f.pe_ratio'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.pe_ratio ?? '—'}
                  </td>
                )}
                {visibleCols['f.roe'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.roe ?? '—'}
                  </td>
                )}
                {visibleCols['f.pb_ratio'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.pb_ratio ?? '—'}
                  </td>
                )}
                {visibleCols['f.roce'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.roce ?? '—'}
                  </td>
                )}
                {visibleCols['f.debt_to_equity'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.debt_to_equity ?? '—'}
                  </td>
                )}
                {visibleCols['f.dividend_yield'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.dividend_yield ?? '—'}%
                  </td>
                )}
                {visibleCols['f.sales_growth_3yr'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.sales_growth_3yr ?? '—'}%
                  </td>
                )}
                {visibleCols['f.profit_growth_3yr'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.profit_growth_3yr ?? '—'}%
                  </td>
                )}
                {visibleCols['f.sales_growth_5yr'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.sales_growth_5yr ?? '—'}%
                  </td>
                )}
                {visibleCols['f.profit_growth_5yr'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {f.profit_growth_5yr ?? '—'}%
                  </td>
                )}
                {visibleCols['p.high_52w'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {p.high_52w ? `₹${format(p.high_52w)}` : '—'}
                  </td>
                )}
                {visibleCols['p.low_52w'] && (
                  <td className={`text-end ${styles.textColor}`}>
                    {p.low_52w ? `₹${format(p.low_52w)}` : '—'}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <Pagination className="d-flex justify-content-center mt-3">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Pagination.Item>
            )
          })}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
      <br />
    </div>
  )
}
