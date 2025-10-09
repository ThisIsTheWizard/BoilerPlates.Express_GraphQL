import { api, expect, loginAndGetTokens } from 'test/setup'

const findRoleByName = async (name, headers) => {
  const response = await api.get('/roles', headers)
  return response.data.data.data.find((role) => role.name === name)
}

const findPermissionByAction = async (action, headers) => {
  const response = await api.get('/permissions', headers)
  return response.data.data.data.find((permission) => permission.action === action)
}

describe('Role-Permission Mutation Tests', () => {
  let authHeaders
  let roleId
  let permission
  let permissionCreatedForTest = false
  let rolePermissionId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const role = await findRoleByName('user', authHeaders)
    roleId = role.id

    permission = await findPermissionByAction('create', authHeaders)
    if (!permission) {
      const response = await api.post(
        '/permissions',
        { action: 'create', module: 'role_permission' },
        authHeaders
      )
      permission = response.data.data
      permissionCreatedForTest = true
    }
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

  describe('POST /role-permissions', () => {
    it('creates a role permission successfully', async () => {
      const response = await api.post(
        '/role-permissions',
        { can_do_the_action: true, permission_id: permission.id, role_id: roleId },
        authHeaders
      )

      expect(response.status).to.equal(201)
      expect(response.data.data).to.include({ permission_id: permission.id, role_id: roleId })
      rolePermissionId = response.data.data.id
    })

    it('returns error when permission_id is missing', async () => {
      let error

      try {
        await api.post(
          '/role-permissions',
          { can_do_the_action: true, role_id: roleId },
          authHeaders
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_PERMISSION_ID')
    })
  })

  describe('PUT /role-permissions/:entity_id', () => {
    before(async () => {
      if (!rolePermissionId) {
        const response = await api.post(
          '/role-permissions',
          { can_do_the_action: true, permission_id: permission.id, role_id: roleId },
          authHeaders
        )
        rolePermissionId = response.data.data.id
      }
    })

    it('updates a role permission successfully', async () => {
      const response = await api.put(
        `/role-permissions/${rolePermissionId}`,
        { can_do_the_action: false },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.can_do_the_action).to.equal(false)
    })

    it('returns 404 for unknown role permission', async () => {
      let error

      try {
        await api.put(
          '/role-permissions/00000000-0000-0000-0000-000000000000',
          { can_do_the_action: true },
          authHeaders
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_PERMISSION_NOT_FOUND')
    })
  })

  describe('DELETE /role-permissions/:entity_id', () => {
    before(async () => {
      if (!rolePermissionId) {
        const response = await api.post(
          '/role-permissions',
          { can_do_the_action: true, permission_id: permission.id, role_id: roleId },
          authHeaders
        )
        rolePermissionId = response.data.data.id
      }
    })

    it('deletes a role permission successfully', async () => {
      const targetId = rolePermissionId
      const response = await api.delete(`/role-permissions/${targetId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(targetId)
      rolePermissionId = null
    })

    it('returns 404 when role permission does not exist', async () => {
      let error

      try {
        await api.delete('/role-permissions/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_PERMISSION_NOT_FOUND')
    })
  })
})
