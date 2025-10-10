import { api, expect, loginAndGetTokens } from 'test/setup'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Permission Mutation Tests', () => {
  let authHeaders
  let createdPermissionId

  const createPermission = async (payload) => {
    const response = await api.post('/permissions', payload, authHeaders)
    createdPermissionId = response.data.data.id
    return response
  }

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    if (createdPermissionId) {
      try {
        await api.delete(`/permissions/${createdPermissionId}`, authHeaders)
      } catch (error) {
        // ignore cleanup failures
      }
    }
  })

  describe('POST /permissions', () => {
    it('creates a permission successfully', async () => {
      const response = await createPermission({ action: 'create', module: 'permission' })

      expect(response.status).to.equal(201)
      expect(response.data.data).to.include({ action: 'create', module: 'permission' })
      expect(createdPermissionId).to.be.a('string')
    })

    it('returns 401 when authorization token is missing', async () => {
      let error

      try {
        await api.post('/permissions', { action: 'read', module: 'user' })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('PUT /permissions/:entity_id', () => {
    let permissionId

    before(async () => {
      if (!createdPermissionId) {
        await createPermission({ action: 'update', module: 'role' })
      }
      permissionId = createdPermissionId
    })

    it('updates a permission successfully', async () => {
      const response = await api.put(`/permissions/${permissionId}`, { module: 'role_permission' }, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.module).to.equal('role_permission')
      await wait(200)
    })

    it('returns 404 for unknown permission', async () => {
      let error

      try {
        await api.put('/permissions/00000000-0000-0000-0000-000000000000', { module: 'user' }, authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('PERMISSION_NOT_FOUND')
    })
  })

  describe('DELETE /permissions/:entity_id', () => {
    let permissionId

    before(async () => {
      if (!createdPermissionId) {
        await createPermission({ action: 'delete', module: 'role_user' })
      }
      permissionId = createdPermissionId
    })

    it('deletes a permission successfully', async () => {
      const response = await api.delete(`/permissions/${permissionId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(permissionId)
      createdPermissionId = null
    })

    it('returns 404 when permission is missing', async () => {
      let error

      try {
        await api.delete(`/permissions/${permissionId}`, authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('PERMISSION_NOT_FOUND')
    })
  })
})
