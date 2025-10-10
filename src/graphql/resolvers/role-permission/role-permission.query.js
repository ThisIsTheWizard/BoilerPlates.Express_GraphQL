import { rolePermissionHelper } from 'src/modules/helpers'

export default {
  getRolePermissions: async () => rolePermissionHelper.getRolePermissions({}),
  getARolePermission: async (_, { id }) => rolePermissionHelper.getARolePermissionForQuery({ entity_id: id }),
  getRolePermissionsByRole: async (_, { role_id }) => rolePermissionHelper.getRolePermissions({ where: { role_id } })
}
