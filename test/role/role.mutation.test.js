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

describe('Role Mutation Tests', () => {
  let authHeaders
  let createdRole

  before(async () => {
    const tokens = await loginAndGetTokens({ email: 'admin@wizardcld.com', password: '123456aA@' })
    authHeaders = { headers: { Authorization: tokens.access_token } }
  })

  after(async () => {
    const existing = await findRoleByName('moderator', authHeaders)
    if (!existing) {
      try {
        const mutation = `
          mutation CreateRole($input: CreateRoleInput!) {
            createRole(input: $input) {
              id
              name
            }
          }
        `
        await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { input: { name: 'moderator' } }
          },
          authHeaders
        )
      } catch (error) {
        // ignore restore failure
      }
    }
  })

  describe('createRole mutation', () => {
    before(async () => {
      const existing = await findRoleByName('moderator', authHeaders)
      if (existing) {
        try {
          const mutation = `
            mutation DeleteRole($entity_id: ID!) {
              deleteRole(entity_id: $entity_id) {
                id
              }
            }
          `
          await api.post(
            '/graphql',
            {
              query: mutation,
              variables: { entity_id: existing.id }
            },
            authHeaders
          )
        } catch (error) {
          // ignore cleanup failure
        }
      }
    })

    it('creates a role successfully', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
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
          variables: { input: { name: 'moderator' } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.createRole).to.include({ name: 'moderator' })
      createdRole = response.data.data.createRole
    })

    it('returns error when name is missing', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: {} }
        },
        authHeaders
      )

      expect(response.status).to.equal(400)
      expect(response.data.errors).to.exist
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation CreateRole($input: CreateRoleInput!) {
          createRole(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { name: 'test' } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('updateRole mutation', () => {
    before(async () => {
      if (!createdRole?.id) {
        createdRole = await findRoleByName('moderator', authHeaders)
      }
      if (!createdRole?.id) {
        const mutation = `
          mutation CreateRole($input: CreateRoleInput!) {
            createRole(input: $input) {
              id
              name
            }
          }
        `
        const response = await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { input: { name: 'moderator' } }
          },
          authHeaders
        )
        createdRole = response.data.data.createRole
      }
    })

    it('updates a role successfully', async () => {
      const mutation = `
        mutation UpdateRole($input: UpdateRoleInput!) {
          updateRole(input: $input) {
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
          variables: { input: { entity_id: createdRole.id, data: { name: 'moderator', description: 'Updated moderator role' } } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.updateRole.id).to.equal(createdRole.id)
    })

    it('returns error for unknown role', async () => {
      const mutation = `
        mutation UpdateRole($input: UpdateRoleInput!) {
          updateRole(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { input: { entity_id: '00000000-0000-0000-0000-000000000000', data: { name: 'admin' } } }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('ROLE_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation UpdateRole($input: UpdateRoleInput!) {
          updateRole(input: $input) {
            id
            name
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { entity_id: createdRole.id, data: { name: 'test' } } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('deleteRole mutation', () => {
    before(async () => {
      if (!createdRole?.id) {
        createdRole = await findRoleByName('moderator', authHeaders)
      }
      if (!createdRole?.id) {
        const mutation = `
          mutation CreateRole($input: CreateRoleInput!) {
            createRole(input: $input) {
              id
              name
            }
          }
        `
        const response = await api.post(
          '/graphql',
          {
            query: mutation,
            variables: { input: { name: 'moderator' } }
          },
          authHeaders
        )
        createdRole = response.data.data.createRole
      }
    })

    it('deletes a role successfully', async () => {
      const mutation = `
        mutation DeleteRole($entity_id: ID!) {
          deleteRole(entity_id: $entity_id) {
            id
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: { entity_id: createdRole.id }
        },
        authHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.deleteRole.id).to.equal(createdRole.id)
      createdRole = null
    })

    it('returns error when role does not exist', async () => {
      const mutation = `
        mutation DeleteRole($entity_id: ID!) {
          deleteRole(entity_id: $entity_id) {
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
      expect(response.data.errors[0].message).to.equal('ROLE_NOT_FOUND')
    })

    it('returns error when not authorized', async () => {
      const mutation = `
        mutation DeleteRole($entity_id: ID!) {
          deleteRole(entity_id: $entity_id) {
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
