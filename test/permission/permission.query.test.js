import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Permission Query Tests', () => {
  let authHeaders
  let permissionId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const mutation = `
      mutation CreatePermission($input: CreatePermissionInput!) {
        createPermission(input: $input) {
          id
          name
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: mutation,
        variables: { input: { name: 'update_user', description: 'Update user permission' } }
      },
      authHeaders
    )
    if (response.data.data?.createPermission) {
      permissionId = response.data.data.createPermission.id
    }
  })

  after(async () => {
    if (permissionId) {
      const mutation = `
        mutation DeletePermission($id: ID!) {
          deletePermission(id: $id) {
            success
          }
        }
      `
      await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { id: permissionId }
        },
        authHeaders
      )
    }
  })

  describe('getPermissions query', () => {
    it('returns permissions for authorized user', async () => {
      const query = `
        query GetPermissions {
          getPermissions {
            id
            name
            description
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.getPermissions).to.be.an('array')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query GetPermissions {
          getPermissions {
            id
            name
          }
        }
      `
      const response = await api.post('/graphql', { query })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('getAPermission query', () => {
    it('returns a single permission when it exists', async () => {
      const query = `
        query GetAPermission($id: ID!) {
          getAPermission(id: $id) {
            id
            name
            description
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { id: permissionId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      if (permissionId) {
        expect(response.data.data.getAPermission.id).to.equal(permissionId)
      }
    })

    it('returns error for non-existent permission', async () => {
      const query = `
        query GetAPermission($id: ID!) {
          getAPermission(id: $id) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { id: '00000000-0000-0000-0000-000000000000' }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PERMISSION_DOES_NOT_EXIST')
    })
  })
})
