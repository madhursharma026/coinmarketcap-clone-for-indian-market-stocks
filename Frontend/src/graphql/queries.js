// ./graphql/query.js
export const GET_ALL_COMPANIES = `
  query {
    companies {
      id
      name
      symbol
      fundamentals {
        pe_ratio
        pb_ratio
        roe
        roce
        debt_to_equity
        dividend_yield
        sales_growth_3yr
        profit_growth_3yr
        sales_growth_5yr
        profit_growth_5yr
        last_updated
      }
      prices {
        current_price
        high_52w
        low_52w
      }
    }
  }
`
