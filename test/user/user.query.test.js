import { expect, graphqlApi, loginAndGetTokens } from 'test/setup'

describe('User Query Tests', () => {
  describe('me query', () => {
    it('returns authenticated user details', async () => {
      const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
      const query = `
        query {
          me {
            id
            email
            first_name
            last_name
            status
          }
        }
      `

      const response = await graphqlApi.post(
        '/graphql',
        { query },
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.me.email).to.equal('test@user.com')
    })

    it('returns error when token is invalid', async () => {
      const query = `
        query {
          me {
            id
            email
          }
        }
      `

      const response = await graphqlApi.post(
        '/graphql',
        { query },
        { headers: { Authorization: 'Bearer invalid-token' } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query {
          me {
            id
            email
          }
        }
      `

      const response = await graphqlApi.post('/graphql', { query })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
