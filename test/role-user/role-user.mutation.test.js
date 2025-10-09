import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

const findRoleByName = async (name, headers) => {
  const response = await api.get('/roles', headers)
  return response.data.data.data.find((role) => role.name === name)
}

describe('Role-User Mutation Tests', () => {
  let authHeaders
  let createdUser
  let primaryRoleId
  let secondaryRoleId
  let roleUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const email = randomEmail('role-user')
    const registerResponse = await api.post('/users/register', {
      email,
      first_name: 'Role',
      last_name: 'User',
      password: 'RoleUser123!@#'
    })
    createdUser = registerResponse.data.data

    const moderatorRole = await findRoleByName('moderator', authHeaders)
    if (!moderatorRole?.id) {
      const createResponse = await api.post('/roles', { name: 'moderator' }, authHeaders)
      primaryRoleId = createResponse.data.data.id
    } else {
      primaryRoleId = moderatorRole.id
    }

    const developerRole = await findRoleByName('developer', authHeaders)
    secondaryRoleId = developerRole.id
  })

  after(async () => {
    if (roleUserId) {
      try {
        await api.delete(`/role-users/${roleUserId}`, authHeaders)
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('POST /role-users', () => {
    it('creates a role-user successfully', async () => {
      const response = await api.post(
        '/role-users',
        { role_id: primaryRoleId, user_id: createdUser.id },
        authHeaders
      )

      expect(response.status).to.equal(201)
      expect(response.data.data).to.include({ role_id: primaryRoleId, user_id: createdUser.id })
      roleUserId = response.data.data.id
    })

    it('returns error when role_id is missing', async () => {
      let error

      try {
        await api.post('/role-users', { user_id: createdUser.id }, authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_ROLE_ID')
    })
  })

  describe('PUT /role-users/:entity_id', () => {
    before(async () => {
      if (!roleUserId) {
        const response = await api.post(
          '/role-users',
          { role_id: primaryRoleId, user_id: createdUser.id },
          authHeaders
        )
        roleUserId = response.data.data.id
      }
    })

    it('updates a role-user successfully', async () => {
      const response = await api.put(
        `/role-users/${roleUserId}`,
        { role_id: secondaryRoleId, user_id: createdUser.id },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data).to.include({ role_id: secondaryRoleId, user_id: createdUser.id })
    })

    it('returns 404 for unknown role-user', async () => {
      let error

      try {
        await api.put(
          '/role-users/00000000-0000-0000-0000-000000000000',
          { role_id: secondaryRoleId, user_id: createdUser.id },
          authHeaders
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_USER_DOES_NOT_EXIST')
    })
  })

  describe('DELETE /role-users/:entity_id', () => {
    before(async () => {
      if (!roleUserId) {
        const response = await api.post(
          '/role-users',
          { role_id: primaryRoleId, user_id: createdUser.id },
          authHeaders
        )
        roleUserId = response.data.data.id
      }
    })

    it('deletes a role-user successfully', async () => {
      const targetId = roleUserId
      const response = await api.delete(`/role-users/${targetId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(targetId)
      roleUserId = null
    })

    it('returns 404 when role-user does not exist', async () => {
      let error

      try {
        await api.delete('/role-users/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_USER_NOT_FOUND')
    })
  })
})
