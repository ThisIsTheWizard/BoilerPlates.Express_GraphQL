import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

const findRoleByName = async (name, headers) => {
  const response = await api.get('/roles', headers)
  return response.data.data.data.find((role) => role.name === name)
}

describe('Role-User Query Tests', () => {
  let authHeaders
  let roleUserId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const email = randomEmail('role-user-query')
    const registerResponse = await api.post('/users/register', {
      email,
      first_name: 'Role',
      last_name: 'UserQuery',
      password: 'RoleUser123!@#'
    })
    const user = registerResponse.data.data

    let role = await findRoleByName('moderator', authHeaders)
    if (!role?.id) {
      const response = await api.post('/roles', { name: 'moderator' }, authHeaders)
      role = response.data.data
    }
    const response = await api.post(
      '/role-users',
      { role_id: role.id, user_id: user.id },
      authHeaders
    )
    roleUserId = response.data.data.id
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

  describe('GET /role-users', () => {
    it('returns role users for authorized user', async () => {
      const response = await api.get('/role-users', authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.meta_data).to.have.keys(['filtered_rows', 'total_rows'])
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/role-users')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /role-users/:entity_id', () => {
    it('returns a single role user when it exists', async () => {
      const response = await api.get(`/role-users/${roleUserId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(roleUserId)
    })

    it('returns 404 for non-existent role user', async () => {
      let error

      try {
        await api.get('/role-users/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_USER_DOES_NOT_EXIST')
    })
  })
})
