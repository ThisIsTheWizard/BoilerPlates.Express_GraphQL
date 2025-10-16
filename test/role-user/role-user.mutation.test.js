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

describe('Role-User Mutation Tests', () => {
  let authHeaders
  let createdUser
  let primaryRoleId
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
  })

  describe('updateRoleUser mutation', () => {
    it('updates a role-user successfully', async () => {
      // Create a fresh user to avoid conflicts with existing role-user mappings
      const email = randomEmail('role-user-update')
      const registerMutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) { id email }
        }
      `
      const regRes = await api.post('/graphql', {
        query: registerMutation,
        variables: { input: { email, first_name: 'RU', last_name: 'Update', password: 'RuUpdate123!@#' } }
      })
      const newUser = regRes.data.data.register

      // Find existing role-user mapping for 'user' role
      const userRole = await findRoleByName('user', authHeaders)
      const roleUsersQuery = `
        query GetRoleUsers { getRoleUsers { data { id role_id user_id } } }
      `
      const ruRes = await api.post('/graphql', { query: roleUsersQuery }, authHeaders)
      let ru = ruRes.data.data.getRoleUsers.data.find((r) => r.user_id === newUser.id && r.role_id === userRole.id)
      if (!ru) {
        const assignMutation = `
          mutation AssignRole($input: CreateRoleUserInput!) {
            assignRole(input: $input) { id role_id user_id }
          }
        `
        const assignRes = await api.post(
          '/graphql',
          { query: assignMutation, variables: { input: { role_id: userRole.id, user_id: newUser.id } } },
          authHeaders
        )
        ru = assignRes.data.data.assignRole
      }

      // Update to moderator role
      const moderatorRole = await findRoleByName('moderator', authHeaders)
      const mutation = `
        mutation UpdateRoleUser($input: UpdateRoleUserInput!) {
          updateRoleUser(input: $input) { id role_id user_id }
        }
      `
      const res = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { entity_id: ru.id, data: { role_id: moderatorRole.id, user_id: newUser.id } } }
        },
        authHeaders
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.updateRoleUser.role_id).to.equal(moderatorRole.id)
    })

    it('returns error when role-user does not exist', async () => {
      const mutation = `
        mutation UpdateRoleUser($input: UpdateRoleUserInput!) {
          updateRoleUser(input: $input) { id }
        }
      `
      const res = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              entity_id: '00000000-0000-0000-0000-000000000000',
              data: { role_id: '00000000-0000-0000-0000-000000000000', user_id: '00000000-0000-0000-0000-000000000000' }
            }
          }
        },
        authHeaders
      )

      expect(res.status).to.equal(200)
      expect(res.data.errors).to.exist
      expect(res.data.errors[0].message).to.equal('ROLE_USER_DOES_NOT_EXIST')
    })

    it('returns unauthorized without token', async () => {
      const mutation = `
        mutation UpdateRoleUser($input: UpdateRoleUserInput!) {
          updateRoleUser(input: $input) { id }
        }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            entity_id: '00000000-0000-0000-0000-000000000000',
            data: { role_id: '00000000-0000-0000-0000-000000000000', user_id: '00000000-0000-0000-0000-000000000000' }
          }
        }
      })

      expect(res.status).to.equal(200)
      expect(res.data.errors).to.exist
      expect(res.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
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

  describe('assignRole mutation', () => {
    it('creates a role-user successfully', async () => {
      const mutation = `
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
        mutation AssignRole($input: CreateRoleUserInput!) {
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

  describe('revokeRole mutation', () => {
    before(async () => {
      if (!roleUserId) {
        const mutation = `
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
        mutation RevokeRole($entity_id: ID!) {
          revokeRole(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: targetId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.revokeRole.id).to.equal(targetId)
      roleUserId = null
    })

    it('returns error when role-user does not exist', async () => {
      const mutation = `
        mutation RevokeRole($entity_id: ID!) {
          revokeRole(entity_id: $entity_id) {
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
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('ROLE_USER_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation RevokeRole($entity_id: ID!) {
          revokeRole(entity_id: $entity_id) {
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
