import { api, expect, loginAndGetTokens } from 'test/setup'

const findRoleByName = async (name, headers) => {
  const response = await api.get('/roles', headers)
  return response.data.data.data.find((role) => role.name === name)
}

describe('Role Mutation Tests', () => {
  let authHeaders
  let createdRole

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    const existing = await findRoleByName('moderator', authHeaders)
    if (!existing) {
      try {
        await api.post('/roles', { name: 'moderator' }, authHeaders)
      } catch (error) {
        // ignore restore failure
      }
    }
  })

  describe('POST /roles', () => {
    before(async () => {
      const existing = await findRoleByName('moderator', authHeaders)
      if (existing) {
        try {
          await api.delete(`/roles/${existing.id}`, authHeaders)
        } catch (error) {
          // ignore cleanup failure
        }
      }
    })

    it('creates a role successfully', async () => {
      const response = await api.post('/roles', { name: 'moderator' }, authHeaders)

      expect(response.status).to.equal(201)
      expect(response.data.data).to.include({ name: 'moderator' })
      createdRole = response.data.data
    })

    it('returns error when name is missing', async () => {
      let error

      try {
        await api.post('/roles', {}, authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_NAME')
    })
  })

  describe('PUT /roles/:entity_id', () => {
    before(async () => {
      if (!createdRole?.id) {
        createdRole = await findRoleByName('moderator', authHeaders)
      }
      if (!createdRole?.id) {
        const response = await api.post('/roles', { name: 'moderator' }, authHeaders)
        createdRole = response.data.data
      }
    })

    it('updates a role successfully', async () => {
      const response = await api.put(`/roles/${createdRole.id}`, { name: 'moderator' }, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(createdRole.id)
    })

    it('returns 404 for unknown role', async () => {
      let error

      try {
        await api.put('/roles/00000000-0000-0000-0000-000000000000', { name: 'admin' }, authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_NOT_FOUND')
    })
  })

  describe('DELETE /roles/:entity_id', () => {
    before(async () => {
      if (!createdRole?.id) {
        createdRole = await findRoleByName('moderator', authHeaders)
      }
      if (!createdRole?.id) {
        const response = await api.post('/roles', { name: 'moderator' }, authHeaders)
        createdRole = response.data.data
      }
    })

    it('deletes a role successfully', async () => {
      const response = await api.delete(`/roles/${createdRole.id}`, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.id).to.equal(createdRole.id)
      createdRole = null
    })

    it('returns 404 when role does not exist', async () => {
      let error

      try {
        await api.delete('/roles/00000000-0000-0000-0000-000000000000', authHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(404)
      expect(error?.response?.data?.message).to.equal('ROLE_NOT_FOUND')
    })
  })
})
