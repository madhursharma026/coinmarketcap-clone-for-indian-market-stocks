import { GET_ALL_COMPANIES } from '@/graphql/queries'
import axios from 'axios'

export default async function handler(req, res) {
  try {
    const response = await axios.post('http://localhost:8000/graphql', {
      query: GET_ALL_COMPANIES,
    })

    const data = response.data
    if (data.errors) {
      return res
        .status(500)
        .json({ error: 'GraphQL query failed', details: data.errors })
    }

    return res.status(200).json(data.data.companies)
  } catch (error) {
    console.error('GraphQL Fetch Error:', error.message)
    return res.status(500).json({ error: 'Failed to fetch GraphQL data' })
  }
}
