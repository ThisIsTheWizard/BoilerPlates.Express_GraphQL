import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

describe('User Mutation Tests', () => {
  let adminHeaders
  let createdUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    adminHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    if (createdUserId) {
      try {
        const mutation = `
          mutation DeleteUser($entity_id: ID!) {
            deleteUser(entity_id: $entity_id) {
              id
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { entity_id: createdUserId }
          },
          adminHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('createUser mutation', () => {
    it('creates a user successfully', async () => {
      const email = randomEmail('create')
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            first_name
            last_name
            status
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              email,
              first_name: 'Test',
              last_name: 'User',
              password: 'Test123!@#'
            }
          }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.createUser.email).to.equal(email)
      createdUserId = response.data.data.createUser.id
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: randomEmail('unauthorized'),
            first_name: 'Test',
            last_name: 'User',
            password: 'Test123!@#'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })

    it('returns error for duplicate email', async () => {
      const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
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
              email: 'admin@test.com',
              first_name: 'Duplicate',
              last_name: 'User',
              password: 'Test123!@#'
            }
          }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    })
  })

  describe('updateUser mutation', () => {
    it('updates a user successfully', async () => {
      const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            first_name
            last_name
            status
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              entity_id: createdUserId,
              data: {
                first_name: 'Updated',
                last_name: 'Name',
                status: 'active'
              }
            }
          }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.updateUser.first_name).to.equal('Updated')
    })

    it('returns error for non-existent user', async () => {
      const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            first_name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              entity_id: '00000000-0000-0000-0000-000000000000',
              data: { first_name: 'Test' }
            }
          }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('USER_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            first_name
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            entity_id: createdUserId,
            data: { first_name: 'Test' }
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('deleteUser mutation', () => {
    it('deletes a user successfully', async () => {
      const mutation = `
        mutation DeleteUser($entity_id: ID!) {
          deleteUser(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: createdUserId }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.deleteUser.id).to.equal(createdUserId)
      createdUserId = null
    })

    it('returns error for non-existent user', async () => {
      const mutation = `
        mutation DeleteUser($entity_id: ID!) {
          deleteUser(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
        },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('USER_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation DeleteUser($entity_id: ID!) {
          deleteUser(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
