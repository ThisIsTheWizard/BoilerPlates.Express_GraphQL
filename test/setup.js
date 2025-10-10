import axios from 'axios'
import { expect } from 'chai'

const api = axios.create({
  baseURL: `http://node_server_test:${process.env.PORT || 8000}`,
  timeout: 10000
})

const graphqlApi = axios.create({
  baseURL: `http://node_server_test:${process.env.PORT || 8000}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const loginAndGetTokens = async ({ email, password }) => {
  const mutation = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        access_token
        refresh_token
      }
    }
  `

  const response = await graphqlApi.post('/graphql', {
    query: mutation,
    variables: {
      input: { email, password }
    }
  })

  return response?.data?.data?.login
}

let authToken = null
before(async () => {
  try {
    await api.post('/test/setup')

    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authToken = tokens?.access_token
  } catch (error) {
    console.error('Error during test setup:', error)
    throw error
  }
})

export { api, authToken, expect, graphqlApi, loginAndGetTokens }
