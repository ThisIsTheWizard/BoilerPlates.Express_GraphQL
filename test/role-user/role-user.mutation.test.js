import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

const findRoleByName = async (name, headers) => {
  const query = `
    query GetRoles {
      getRoles {
        id
        name
        description
      }
    }
  `
  const response = await api.post('/graphql', { query }, headers)
  return response.data.data?.getRoles?.find((role) => role.name === name)
}

describe('Role-User Mutation Tests', () => {
  let authHeaders
  let createdUser
  let primaryRoleId
  let secondaryRoleId
  let roleUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const email = randomEmail('role-user')
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
          last_name: 'User',
          password: 'RoleUser123!@#'
        }
      }
    })
    createdUser = registerResponse.data.data.register

    const moderatorRole = await findRoleByName('moderator', authHeaders)
    if (!moderatorRole?.id) {
      const createMutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const createResponse = await api.post(
        '/graphql',
        {
          query: createMutation,
          variables: { input: { name: 'moderator' } }
        },
        authHeaders
      )
      primaryRoleId = createResponse.data.data.createRole.id
    } else {
      primaryRoleId = moderatorRole.id
    }

    const developerRole = await findRoleByName('developer', authHeaders)
    secondaryRoleId = developerRole.id
  })

  after(async () => {
    if (roleUserId) {
      try {
        const mutation = `
          mutation RemoveRole($id: ID!) {
            removeRole(id: $id) {
              success
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { id: roleUserId }
          },
          authHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('assignRole mutation', () => {
    it('creates a role-user successfully', async () => {
      const mutation = `
        mutation AssignRole($input: AssignRoleInput!) {
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
          query: mutation,
          variables: { input: { role_id: primaryRoleId, user_id: createdUser.id } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.assignRole).to.include({ role_id: primaryRoleId, user_id: createdUser.id })
      roleUserId = response.data.data.assignRole.id
    })

    it('returns error when role_id is missing', async () => {
      const mutation = `
        mutation AssignRole($input: AssignRoleInput!) {
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
          query: mutation,
          variables: { input: { user_id: createdUser.id } }
        },
        authHeaders
      )

      expect(response.status).to.equal(400)
      expect(response.data.errors).to.exist
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation AssignRole($input: AssignRoleInput!) {
          assignRole(input: $input) {
            id
            role_id
            user_id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { role_id: primaryRoleId, user_id: createdUser.id } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('removeRole mutation', () => {
    before(async () => {
      if (!roleUserId) {
        const mutation = `
          mutation AssignRole($input: AssignRoleInput!) {
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
            query: mutation,
            variables: { input: { role_id: primaryRoleId, user_id: createdUser.id } }
          },
          authHeaders
        )
        roleUserId = response.data.data.assignRole.id
      }
    })

    it('deletes a role-user successfully', async () => {
      const targetId = roleUserId
      const mutation = `
        mutation RemoveRole($id: ID!) {
          removeRole(id: $id) {
            success
            message
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { id: targetId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.removeRole.success).to.equal(true)
      roleUserId = null
    })

    it('returns error when role-user does not exist', async () => {
      const mutation = `
        mutation RemoveRole($id: ID!) {
          removeRole(id: $id) {
            success
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { id: '00000000-0000-0000-0000-000000000000' }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('ROLE_USER_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation RemoveRole($id: ID!) {
          removeRole(id: $id) {
            success
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
