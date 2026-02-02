import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Auth Query Tests', () => {
  let adminHeaders

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@wizardcld.com', password: '123456aA@' })
    adminHeaders = { headers: { Authorization: tokens.access_token } }
  })

  describe('user query', () => {
    it('returns authenticated user details', async () => {
      const query = `
        query {
          user {
            id
            email
            first_name
            last_name
            status
          }
        }
      `
      const response = await api.post('/graphql', { query }, adminHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.user.email).to.equal('admin@wizardcld.com')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query {
          user {
            id
            email
          }
        }
      `
      const response = await api.post('/graphql', { query })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })

    it('returns error when token is invalid', async () => {
      const query = `
        query {
          user {
            id
            email
          }
        }
      `
      const response = await api.post('/graphql', { query }, { headers: { Authorization: 'invalid-token' } })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
