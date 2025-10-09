import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Role Query Tests', () => {
  let authHeaders
  let anyRole

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const response = await api.get('/roles', authHeaders)
    anyRole = response.data.data.data[0]
  })

  describe('GET /roles', () => {
    it('returns roles for authorized user', async () => {
      const response = await api.get('/roles', authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.data).to.be.an('array')
      expect(response.data.data.meta_data).to.have.keys(['filtered_rows', 'total_rows'])
    })

    it('returns 401 when token is missing', async () => {
      let error

      try {
        await api.get('/roles')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('GET /roles/:entity_id', () => {
    it('returns a single role when it exists', async () => {
      const response = await api.get(`/roles/${anyRole.id}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(anyRole.id)
    })

    it('returns 404 for non-existent role', async () => {
      let error

      try {
        await api.get('/roles/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_DOES_NOT_EXIST')
    })
  })
})
