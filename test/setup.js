import axios from 'axios'
import { expect } from 'chai'

// Seed the test database
import { seedDatabase } from 'src/utils/seed'

const graphqlApi = axios.create({
  baseURL: `http://node_server_test:${process.env.PORT || 8000}`,
  timeout: 10000,
  // Always resolve; tests assert on status codes and bodies, including 400s
  validateStatus: () => true
})

const loginAndGetTokens = async ({ email, password }) => {
  const response = await graphqlApi.post('/graphql', {
    query: `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          access_token
          refresh_token
        }
      }
    `,
    variables: { input: { email, password } }
  })

  return response?.data?.data?.login
}

let authToken = null
before(async () => {
  try {
    await seedDatabase(true)

    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authToken = tokens?.access_token
  } catch (error) {
    console.error('Error during test setup:', error)
    throw error
  }
})

export { graphqlApi as api, authToken, expect, loginAndGetTokens }
