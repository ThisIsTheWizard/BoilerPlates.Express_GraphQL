import { api, expect, loginAndGetTokens } from 'test/setup'

describe('Permission Mutation Tests', () => {
  let authHeaders
  let createdPermissionId

  const createPermission = async (input) => {
    const mutation = `
      mutation CreatePermission($input: CreatePermissionInput!) {
        createPermission(input: $input) {
          id
          name
          description
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
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    if (createdPermissionId) {
      try {
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
            variables: { id: createdPermissionId }
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
      const response = await createPermission({ name: 'create_permission', description: 'Create permission' })

      expect(response.status).to.equal(200)
      expect(response.data.data.createPermission).to.include({
        name: 'create_permission',
        description: 'Create permission'
      })
      expect(createdPermissionId).to.be.a('string')
    })

    it('returns error when authorization token is missing', async () => {
      const mutation = `
        mutation CreatePermission($input: CreatePermissionInput!) {
          createPermission(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { name: 'read_user' } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })

    it('returns error for duplicate permission name', async () => {
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
          variables: { input: { name: 'create_permission', description: 'Duplicate permission' } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
    })
  })

  describe('updatePermission mutation', () => {
    let permissionId

    before(async () => {
      if (!createdPermissionId) {
        await createPermission({ name: 'update_role', description: 'Update role' })
      }
      permissionId = createdPermissionId
    })

    it('updates a permission successfully', async () => {
      const mutation = `
        mutation UpdatePermission($input: UpdatePermissionInput!) {
          updatePermission(input: $input) {
            id
            name
            description
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { id: permissionId, description: 'Updated role permission' } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.updatePermission.description).to.equal('Updated role permission')
    })

    it('returns error for unknown permission', async () => {
      const mutation = `
        mutation UpdatePermission($input: UpdatePermissionInput!) {
          updatePermission(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { id: '00000000-0000-0000-0000-000000000000', name: 'user' } }
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
            name
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { id: permissionId, name: 'test' } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('deletePermission mutation', () => {
    let permissionId

    before(async () => {
      if (!createdPermissionId) {
        await createPermission({ name: 'delete_role_user', description: 'Delete role user' })
      }
      permissionId = createdPermissionId
    })

    it('deletes a permission successfully', async () => {
      const mutation = `
        mutation DeletePermission($id: ID!) {
          deletePermission(id: $id) {
            success
            message
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { id: permissionId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.deletePermission.success).to.equal(true)
      createdPermissionId = null
    })

    it('returns error when permission is missing', async () => {
      const mutation = `
        mutation DeletePermission($id: ID!) {
          deletePermission(id: $id) {
            success
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { id: permissionId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PERMISSION_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation DeletePermission($id: ID!) {
          deletePermission(id: $id) {
            success
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { id: '00000000-0000-0000-0000-000000000000' }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
