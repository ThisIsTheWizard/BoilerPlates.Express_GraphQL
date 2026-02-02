import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Permission Query Tests', () => {
  let authHeaders
  let permissionId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@wizardcld.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const mutation = `
      mutation CreatePermission($input: CreatePermissionInput!) {
        createPermission(input: $input) {
          id
          action
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: mutation,
        variables: { input: { action: 'update', module: 'user' } }
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
        mutation DeletePermission($entity_id: ID!) {
          deletePermission(entity_id: $entity_id) {
            id
          }
        }
      `
      await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: permissionId }
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
            data {
              id
              action
              module
            }
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
      expect(response.data.data.getPermissions.data).to.be.an('array')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query GetPermissions {
          getPermissions {
            data {
              id
              action
            }
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
        query GetAPermission($entity_id: ID!) {
          getAPermission(entity_id: $entity_id) {
            id
            action
            module
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: permissionId }
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
        query GetAPermission($entity_id: ID!) {
          getAPermission(entity_id: $entity_id) {
            id
            action
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PERMISSION_DOES_NOT_EXIST')
    })
  })
})
