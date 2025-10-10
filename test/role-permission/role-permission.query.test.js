import { api, expect, loginAndGetTokens } from 'test/setup'

const findRoleByName = async (name, headers) => {
  const response = await api.get('/roles', headers)
  return response.data.data.data.find((role) => role.name === name)
}

const findPermissionByAction = async (action, headers) => {
  const response = await api.get('/permissions', headers)
  return response.data.data.data.find((permission) => permission.action === action)
}

describe('Role-Permission Query Tests', () => {
  let authHeaders
  let rolePermissionId
  let permission
  let permissionCreatedForTest = false

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const role = await findRoleByName('user', authHeaders)

    permission = await findPermissionByAction('read', authHeaders)
    if (!permission) {
      const response = await api.post('/permissions', { action: 'read', module: 'role_permission' }, authHeaders)
      permission = response.data.data
      permissionCreatedForTest = true
    }

    const response = await api.post(
      '/role-permissions',
      { can_do_the_action: true, permission_id: permission.id, role_id: role.id },
      authHeaders
    )
    rolePermissionId = response.data.data.id
  })

  after(async () => {
    if (rolePermissionId) {
      try {
        await api.delete(`/role-permissions/${rolePermissionId}`, authHeaders)
      } catch (error) {
        // ignore cleanup failure
      }
    }

    if (permissionCreatedForTest && permission?.id) {
      try {
        await api.delete(`/permissions/${permission.id}`, authHeaders)
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('GET /role-permissions', () => {
    it('returns role permissions for authorized user', async () => {
      const response = await api.get('/role-permissions', authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.meta_data).to.have.keys(['filtered_rows', 'total_rows'])
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/role-permissions')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /role-permissions/:entity_id', () => {
    it('returns a single role permission when it exists', async () => {
      const response = await api.get(`/role-permissions/${rolePermissionId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(rolePermissionId)
    })

    it('returns 404 for non-existent role permission', async () => {
      let error

      try {
        await api.get('/role-permissions/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_PERMISSION_DOES_NOT_EXIST')
    })
  })
})
