import { authMutation } from './auth.mutation'
import { authQuery } from './auth.query'
import { permissionMutation } from './permission.mutation'
import { permissionQuery } from './permission.query'
import { rolePermissionMutation } from './role-permission.mutation'
import { rolePermissionQuery } from './role-permission.query'
import { roleUserMutation } from './role-user.mutation'
import { roleUserQuery } from './role-user.query'
import { roleMutation } from './role.mutation'
import { roleQuery } from './role.query'
import { userMutation } from './user.mutation'
import { userQuery } from './user.query'

export const resolvers = {
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
