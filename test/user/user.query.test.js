import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

describe('User Query Tests', () => {
  let adminHeaders
  let testUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    adminHeaders = { headers: { Authorization: tokens.access_token } }

    const mutation = `
      mutation CreateUser($input: RegisterInput!) {
        createUser(input: $input) {
          id
          email
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: mutation,
        variables: {
          input: {
            email: randomEmail('query-test'),
            first_name: 'Query',
            last_name: 'Test',
            password: 'Test123!@#'
          }
        }
      },
      adminHeaders
    )
    testUserId = response.data.data.createUser.id
  })

  after(async () => {
    if (testUserId) {
      try {
        const mutation = `
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id) {
              success
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { id: testUserId }
          },
          adminHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('getUsers query', () => {
    it('returns users for authorized admin', async () => {
      const query = `
        query GetUsers {
          getUsers {
            data {
              id
              email
              first_name
              last_name
              status
            }
          }
        }
      `
      const response = await api.post('/graphql', { query }, adminHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.getUsers.data).to.be.an('array')
      expect(response.data.data.getUsers.data.length).to.be.greaterThan(0)
    })

    it('returns error when not authorized', async () => {
      const query = `
        query GetUsers {
          getUsers {
            data {
              id
              email
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

  describe('getAUser query', () => {
    it('returns a single user when it exists', async () => {
      const query = `
        query GetAUser($entity_id: String!) {
          getAUser(entity_id: $entity_id) {
            id
            email
            first_name
            last_name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: testUserId }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.getAUser.id).to.equal(testUserId)
    })

    it('returns error for non-existent user', async () => {
      const query = `
        query GetAUser($entity_id: String!) {
          getAUser(entity_id: $entity_id) {
            id
            email
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('USER_DOES_NOT_EXIST')
    })
  })
})
