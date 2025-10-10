import { api, expect, loginAndGetTokens } from 'test/setup'

const findRoleByName = async (name, headers) => {
  const query = `
    query GetRoles {
      getRoles {
        data {
          id
          name
          description
        }
      }
    }
  `
  const response = await api.post('/graphql', { query }, headers)
  return response.data.data?.getRoles?.data?.find((role) => role.name === name)
}

const findPermissionByName = async (name, headers) => {
  const query = `
    query GetPermissions {
      getPermissions {
        data {
          id
          name
          description
        }
      }
    }
  `
  const response = await api.post('/graphql', { query }, headers)
  return response.data.data?.getPermissions?.data?.find((permission) => permission.name === name)
}

describe('Role-Permission Query Tests', () => {
  let authHeaders
  let rolePermissionId
  let permission
  let permissionCreatedForTest = false

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const role = await findRoleByName('user', authHeaders)

    permission = await findPermissionByName('read_role_permission', authHeaders)
    if (!permission) {
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
          variables: { input: { name: 'read_role_permission', description: 'Read role permission' } }
        },
        authHeaders
      )
      permission = response.data.data?.createPermission
      permissionCreatedForTest = true
    }

    const assignMutation = `
      mutation AssignPermission($input: AssignPermissionInput!) {
        assignPermission(input: $input) {
          id
          role_id
          permission_id
        }
      }
    `
    const response = await api.post(
      '/graphql',
      {
        query: assignMutation,
        variables: { input: { permission_id: permission.id, role_id: role.id } }
      },
      authHeaders
    )
    rolePermissionId = response.data.data?.assignPermission?.id
  })

  after(async () => {
    if (rolePermissionId) {
      try {
        const mutation = `
          mutation RemovePermission($id: ID!) {
            removePermission(id: $id) {
              success
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { id: rolePermissionId }
          },
          authHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }

    if (permissionCreatedForTest && permission?.id) {
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
            variables: { id: permission.id }
          },
          authHeaders
        )
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('getRolePermissions query', () => {
    it('returns role permissions for authorized user', async () => {
      const query = `
        query GetRolePermissions {
          getRolePermissions {
            data {
              id
              role_id
              permission_id
              role {
                name
              }
              permission {
                name
              }
            }
          }
        }
      `
      const response = await api.post('/graphql', { query }, authHeaders)

      expect(response.status).to.equal(200)
      expect(response.data.data.getRolePermissions.data).to.be.an('array')
    })

    it('returns error when token is missing', async () => {
      const query = `
        query GetRolePermissions {
          getRolePermissions {
            data {
              id
              role_id
              permission_id
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

  describe('getARolePermission query', () => {
    it('returns a single role permission when it exists', async () => {
      const query = `
        query GetARolePermission($entity_id: String!) {
          getARolePermission(entity_id: $entity_id) {
            id
            role_id
            permission_id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query,
          variables: { entity_id: rolePermissionId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      if (rolePermissionId) {
        expect(response.data.data.getARolePermission.id).to.equal(rolePermissionId)
      }
    })

    it('returns error for non-existent role permission', async () => {
      const query = `
        query GetARolePermission($entity_id: String!) {
          getARolePermission(entity_id: $entity_id) {
            id
            role_id
            permission_id
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
      expect(response.data.errors[0].message).to.equal('ROLE_PERMISSION_DOES_NOT_EXIST')
    })
  })
})
