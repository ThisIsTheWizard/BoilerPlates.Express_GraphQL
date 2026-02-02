import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Permission Mutation Tests', () => {
  let authHeaders
  let createdPermissionId

  const createPermission = async (input) => {
    const mutation = `
      mutation CreatePermission($input: CreatePermissionInput!) {
        createPermission(input: $input) {
          id
          action
          module
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: mutation,
        variables: { input }
      },
      authHeaders
    )
    if (response.data.data?.createPermission) {
      createdPermissionId = response.data.data.createPermission.id
    }
    return response
  }

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@wizardcld.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    if (createdPermissionId) {
      try {
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
            variables: { entity_id: createdPermissionId }
          },
          authHeaders
        )
      } catch (error) {
        // ignore cleanup failures
      }
    }
  })

  describe('createPermission mutation', () => {
    it('creates a permission successfully', async () => {
      const response = await createPermission({ action: 'create', module: 'permission' })

      expect(response.status).to.equal(200)
      expect(response.data.data.createPermission).to.include({
        action: 'create',
        module: 'permission'
      })
      expect(createdPermissionId).to.be.a('string')
    })

    it('returns error when authorization token is missing', async () => {
      const mutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
            action
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { action: 'read', module: 'user' } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('updatePermission mutation', () => {
    let permissionId

    before(async () => {
      if (!createdPermissionId) {
        await createPermission({ action: 'update', module: 'role' })
      }
      permissionId = createdPermissionId
    })

    it('updates a permission successfully', async () => {
      const mutation = `
        mutation UpdatePermission($input: UpdatePermissionInput!) {
          updatePermission(input: $input) {
            id
            action
            module
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { entity_id: permissionId, data: { module: 'role_permission' } } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.updatePermission.module).to.equal('role_permission')
    })

    it('returns error for unknown permission', async () => {
      const mutation = `
        mutation UpdatePermission($input: UpdatePermissionInput!) {
          updatePermission(input: $input) {
            id
            action
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: { entity_id: '00000000-0000-0000-0000-000000000000', data: { action: 'user' } }
          }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PERMISSION_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation UpdatePermission($input: UpdatePermissionInput!) {
          updatePermission(input: $input) {
            id
            action
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { entity_id: permissionId, data: { action: 'test' } } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('deletePermission mutation', () => {
    let permissionId

    before(async () => {
      const response = await createPermission({ action: 'delete', module: 'role_user' })
      permissionId = response.data.data.createPermission.id
    })

    it('deletes a permission successfully', async () => {
      const mutation = `
        mutation DeletePermission($entity_id: ID!) {
          deletePermission(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: permissionId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.deletePermission.id).to.equal(permissionId)
      createdPermissionId = null
    })

    it('returns error when permission is missing', async () => {
      const mutation = `
        mutation DeletePermission($entity_id: ID!) {
          deletePermission(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PERMISSION_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation DeletePermission($entity_id: ID!) {
          deletePermission(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { entity_id: '00000000-0000-0000-0000-000000000000' }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
