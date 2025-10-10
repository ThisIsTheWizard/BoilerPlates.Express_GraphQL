import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Permission Query Tests', () => {
  let authHeaders
  let permissionId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const response = await api.post('/permissions', { action: 'update', module: 'user' }, authHeaders)
    permissionId = response.data.data.id
  })

  after(async () => {
    if (permissionId) {
      await api.delete(`/permissions/${permissionId}`, authHeaders)
    }
  })

  describe('GET /permissions', () => {
    it('returns permissions for authorized user', async () => {
      const response = await api.get('/permissions', authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.meta_data).to.have.keys(['filtered_rows', 'total_rows'])
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/permissions')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /permissions/:entity_id', () => {
    it('returns a single permission when it exists', async () => {
      const response = await api.get(`/permissions/${permissionId}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(permissionId)
    })

    it('returns 404 for non-existent permission', async () => {
      let error

      try {
        await api.get('/permissions/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('PERMISSION_DOES_NOT_EXIST')
    })
  })
})
