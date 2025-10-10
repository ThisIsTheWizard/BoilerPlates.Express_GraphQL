import { commonHelper, rolePermissionHelper } from 'src/modules/helpers'

export default {
  getARolePermission: async (parent, args) => rolePermissionHelper.getARolePermissionForQuery(args),
  getRolePermissions: async (parent, args, context) =>
    rolePermissionHelper.getRolePermissionsForQuery(
      commonHelper.prepareRequestForQuery(args, context)
    )
}
