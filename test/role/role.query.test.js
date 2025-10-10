import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Role Query Tests', () => {
  let authHeaders
  let anyRole

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const query = `
      query GetRoles {
        getRoles {
          id
          name
          description
        }
      }
    `
    const response = await api.post('/graphql', { query }, authHeaders)
    anyRole = response.data.data.getRoles.data[0]
  })

  describe('getRoles query', () => {
    it('returns roles for authorized user', async () => {
      const query = `
        query GetRoles {
          getRoles {
            data {
              id
              name
              description
            }
          }
        }
      `
      const response = await api.post('/graphql', { query }, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.getRoles.data).to.be.an('array')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query GetRoles {
          getRoles {
            data {
              id
              name
            }
          }
        }
      `
      const response = await api.post('/graphql', { query })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('getARole query', () => {
    it('returns a single role when it exists', async () => {
      const query = `
        query GetARole($entity_id: String!) {
          getARole(entity_id: $entity_id) {
            id
            name
            description
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: anyRole.id }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.getARole.id).to.equal(anyRole.id)
    })

    it('returns error for non-existent role', async () => {
      const query = `
        query GetARole($entity_id: String!) {
          getARole(entity_id: $entity_id) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('ROLE_DOES_NOT_EXIST')
    })
  })
})
