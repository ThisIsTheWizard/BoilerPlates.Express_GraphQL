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

const findPermissionByActionAndModule = async (action, module, headers) => {
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
  const response = await api.post('/graphql', { query }, headers)
  return response.data.data?.getPermissions?.data?.find(
    (permission) => permission.action === action && permission.module === module
  )
}

describe('Role-Permission Mutation Tests', () => {
  let authHeaders
  let roleId
  let permission
  let permissionCreatedForTest = false
  let rolePermissionId

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }

    const role = await findRoleByName('user', authHeaders)
    roleId = role.id

    permission = await findPermissionByActionAndModule('create', 'role_permission', authHeaders)
    if (!permission) {
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
          variables: { input: { action: 'create', module: 'role_permission' } }
        },
        authHeaders
      )
      permission = response.data.data?.createPermission
      permissionCreatedForTest = true
    }
  })

  after(async () => {
    if (rolePermissionId) {
      try {
        const mutation = `
          mutation RevokePermission($entity_id: ID!) {
            revokePermission(entity_id: $entity_id) {
              id
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { entity_id: rolePermissionId }
          },
          authHeaders
        )
      } catch {
        // ignore cleanup failure
      }
    }

    if (permissionCreatedForTest && permission?.id) {
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
            variables: { entity_id: permission.id }
          },
          authHeaders
        )
      } catch {
        // ignore cleanup failure
      }
    }
  })

  describe('assignPermission mutation', () => {
    it('creates a role permission successfully', async () => {
      const mutation = `
        mutation AssignPermission($input: RolePermissionInput!) {
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
          query: mutation,
          variables: { input: { permission_id: permission.id, role_id: roleId } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.assignPermission).to.include({ permission_id: permission.id, role_id: roleId })
      rolePermissionId = response.data.data.assignPermission.id
    })

    it('returns error when permission_id is missing', async () => {
      const mutation = `
        mutation AssignPermission($input: RolePermissionInput!) {
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
          query: mutation,
          variables: { input: { role_id: roleId } }
        },
        authHeaders
      )

      expect(response.status).to.equal(400)
      expect(response.data.errors).to.exist
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation AssignPermission($input: RolePermissionInput!) {
          assignPermission(input: $input) {
            id
            role_id
            permission_id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { permission_id: permission.id, role_id: roleId } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('revokePermission mutation', () => {
    before(async () => {
      if (!rolePermissionId) {
        const mutation = `
          mutation AssignPermission($input: RolePermissionInput!) {
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
            query: mutation,
            variables: { input: { permission_id: permission.id, role_id: roleId } }
          },
          authHeaders
        )
        rolePermissionId = response.data.data.assignPermission.id
      }
    })

    it('deletes a role permission successfully', async () => {
      const targetId = rolePermissionId
      const mutation = `
        mutation RevokePermission($input: RolePermissionInput!) {
          revokePermission(input: $input) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { role_id: roleId, permission_id: permission.id } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.revokePermission.id).to.equal(targetId)
      rolePermissionId = null
    })

    it('returns error when role permission does not exist', async () => {
      const mutation = `
        mutation RevokePermission($input: RolePermissionInput!) {
          revokePermission(input: $input) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              permission_id: '00000000-0000-0000-0000-000000000000',
              role_id: '00000000-0000-0000-0000-000000000000'
            }
          }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('ROLE_PERMISSION_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation RevokePermission($input: RolePermissionInput!) {
          revokePermission(input: $input) {
            id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            permission_id: '00000000-0000-0000-0000-000000000000',
            role_id: '00000000-0000-0000-0000-000000000000'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
