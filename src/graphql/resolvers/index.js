import authMutation from 'src/graphql/resolvers/auth/auth.mutation'
import permissionMutation from 'src/graphql/resolvers/permission/permission.mutation'
import rolePermissionMutation from 'src/graphql/resolvers/role-permission/role-permission.mutation'
import roleUserMutation from 'src/graphql/resolvers/role-user/role-user.mutation'
import roleMutation from 'src/graphql/resolvers/role/role.mutation'
import userMutation from 'src/graphql/resolvers/user/user.mutation'

import authQuery from 'src/graphql/resolvers/auth/auth.query'
import permissionQuery from 'src/graphql/resolvers/permission/permission.query'
import rolePermissionQuery from 'src/graphql/resolvers/role-permission/role-permission.query'
import roleUserQuery from 'src/graphql/resolvers/role-user/role-user.query'
import roleQuery from 'src/graphql/resolvers/role/role.query'
import userQuery from 'src/graphql/resolvers/user/user.query'

export default {
  Query: {
    ...authQuery,
    ...userQuery,
    ...roleQuery,
    ...permissionQuery,
    ...roleUserQuery,
    ...rolePermissionQuery
  },
  Mutation: {
    ...authMutation,
    ...userMutation,
    ...roleMutation,
    ...permissionMutation,
    ...roleUserMutation,
    ...rolePermissionMutation
  }
}
