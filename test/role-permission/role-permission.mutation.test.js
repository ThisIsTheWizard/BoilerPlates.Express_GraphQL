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

  describe('updateRolePermission mutation', () => {
    before(async () => {
      if (!rolePermissionId) {
        const assignMutation = `
          mutation AssignPermission($input: CreateRolePermissionInput!) {
            assignPermission(input: $input) { id role_id permission_id can_do_the_action }
          }
        `
        const assignRes = await api.post(
          '/graphql',
          { query: assignMutation, variables: { input: { role_id: roleId, permission_id: permission.id, can_do_the_action: true } } },
          authHeaders
        )
        rolePermissionId = assignRes.data.data.assignPermission.id
      }
    })

    it('updates can_do_the_action successfully', async () => {
      const mutation = `
        mutation UpdateRolePermission($input: UpdateRolePermissionInput!) {
          updateRolePermission(input: $input) { id can_do_the_action }
        }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { input: { entity_id: rolePermissionId, data: { role_id: roleId, permission_id: permission.id, can_do_the_action: false } } } },
        authHeaders
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.updateRolePermission.can_do_the_action).to.equal(false)
    })

    it('returns error when role-permission does not exist', async () => {
      const mutation = `
        mutation UpdateRolePermission($input: UpdateRolePermissionInput!) {
          updateRolePermission(input: $input) { id }
        }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { input: { entity_id: '00000000-0000-0000-0000-000000000000', data: { can_do_the_action: true, role_id: roleId, permission_id: permission.id } } } },
        authHeaders
      )

      expect(res.status).to.equal(200)
      expect(res.data.errors).to.exist
      expect(res.data.errors[0].message).to.equal('ROLE_PERMISSION_NOT_FOUND')
    })

    it('returns unauthorized without token', async () => {
      const mutation = `
        mutation UpdateRolePermission($input: UpdateRolePermissionInput!) {
          updateRolePermission(input: $input) { id }
        }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: { input: { entity_id: rolePermissionId, data: { can_do_the_action: true, role_id: roleId, permission_id: permission.id } } }
      })

      expect(res.status).to.equal(200)
      expect(res.data.errors).to.exist
      expect(res.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  after(async () => {
    if (rolePermissionId) {
      try {
        const mutation = `
          mutation RemovePermission($entity_id: ID!) {
            removePermission(entity_id: $entity_id) {
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
      } catch (error) {
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
      } catch (error) {
        // ignore cleanup failure
      }
    }
  })

  describe('assignPermission mutation', () => {
    it('creates a role permission successfully', async () => {
      const mutation = `
        mutation AssignPermission($input: CreateRolePermissionInput!) {
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
          variables: { input: { permission_id: permission.id, role_id: roleId, can_do_the_action: true } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.assignPermission).to.include({ permission_id: permission.id, role_id: roleId })
      rolePermissionId = response.data.data.assignPermission.id
    })

    it('returns error when permission_id is missing', async () => {
      const mutation = `
        mutation AssignPermission($input: CreateRolePermissionInput!) {
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
          variables: { input: { role_id: roleId, can_do_the_action: true } }
        },
        authHeaders
      )

      expect(response.status).to.equal(400)
      expect(response.data.errors).to.exist
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation AssignPermission($input: CreateRolePermissionInput!) {
          assignPermission(input: $input) {
            id
            role_id
            permission_id
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { permission_id: permission.id, role_id: roleId, can_do_the_action: true } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('removePermission mutation', () => {
    before(async () => {
      if (!rolePermissionId) {
        const mutation = `
          mutation AssignPermission($input: CreateRolePermissionInput!) {
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
            variables: { input: { permission_id: permission.id, role_id: roleId, can_do_the_action: true } }
          },
          authHeaders
        )
        rolePermissionId = response.data.data.assignPermission.id
      }
    })

    it('deletes a role permission successfully', async () => {
      const targetId = rolePermissionId
      const mutation = `
        mutation RemovePermission($entity_id: ID!) {
          removePermission(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: targetId }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.removePermission.id).to.equal(targetId)
      rolePermissionId = null
    })

    it('returns error when role permission does not exist', async () => {
      const mutation = `
        mutation RemovePermission($entity_id: ID!) {
          removePermission(entity_id: $entity_id) {
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
      expect(response.data.errors[0].message).to.equal('ROLE_PERMISSION_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation RemovePermission($entity_id: ID!) {
          removePermission(entity_id: $entity_id) {
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
