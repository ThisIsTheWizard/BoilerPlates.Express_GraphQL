import { rolePermissionHelper } from 'src/modules/helpers'

export default {
  getRolePermissions: async () => rolePermissionHelper.getRolePermissions({}),
  getARolePermission: async (_, { id }) => rolePermissionHelper.getARolePermission({ where: { id } }),
  getRolePermissionsByRole: async (_, { role_id }) => rolePermissionHelper.getRolePermissions({ where: { role_id } })
}
