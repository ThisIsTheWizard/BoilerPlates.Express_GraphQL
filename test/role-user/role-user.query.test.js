import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

const findRoleByName = async (name, headers) => {
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
  const response = await api.post('/graphql', { query }, headers)
  return response.data.data?.getRoles?.data?.find((role) => role.name === name)
}

describe('Role-User Query Tests', () => {
  let authHeaders
  let roleUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const email = randomEmail('role-user-query')
    const registerMutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          id
          email
        }
      }
    `
    const registerResponse = await api.post('/graphql', {
      query: registerMutation,
      variables: {
        input: {
          email,
          first_name: 'Role',
          last_name: 'UserQuery',
          password: 'RoleUser123!@#'
        }
      }
    })
    const user = registerResponse.data.data.register

    let role = await findRoleByName('moderator', authHeaders)
    if (!role?.id) {
      const createMutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: createMutation,
          variables: { input: { name: 'moderator' } }
        },
        authHeaders
      )
      role = response.data.data.createRole
    }
    const assignMutation = `
      mutation AssignRole($input: CreateRoleUserInput!) {
        assignRole(input: $input) {
          id
          role_id
          user_id
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: assignMutation,
        variables: { input: { role_id: role.id, user_id: user.id } }
      },
      authHeaders
    )
    roleUserId = response.data.data.assignRole.id
  })

  after(async () => {
    if (roleUserId) {
      try {
        const mutation = `
          mutation RevokeRole($entity_id: ID!) {
            revokeRole(entity_id: $entity_id) {
              id
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { entity_id: roleUserId }
          },
          authHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('getRoleUsers query', () => {
    it('returns role users for authorized user', async () => {
      const query = `
        query GetRoleUsers {
          getRoleUsers {
            data {
              id
              role_id
              user_id
            }
          }
        }
      `
      const response = await api.post('/graphql', { query }, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.getRoleUsers.data).to.be.an('array')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query GetRoleUsers {
          getRoleUsers {
            data {
              id
              role_id
              user_id
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

  describe('getARoleUser query', () => {
    it('returns a single role user when it exists', async () => {
      const query = `
        query GetARoleUser($entity_id: ID!) {
          getARoleUser(entity_id: $entity_id) {
            id
            role_id
            user_id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: roleUserId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.getARoleUser.id).to.equal(roleUserId)
    })

    it('returns error for non-existent role user', async () => {
      const query = `
        query GetARoleUser($entity_id: ID!) {
          getARoleUser(entity_id: $entity_id) {
            id
            role_id
            user_id
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
      expect(response.data.errors[0].message).to.equal('ROLE_USER_DOES_NOT_EXIST')
    })
  })
})
