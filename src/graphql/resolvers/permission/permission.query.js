import { commonHelper, permissionHelper } from 'src/modules/helpers'

export default {
  getAPermission: async (parent, args) => permissionHelper.getAPermissionForQuery(args),
  getPermissions: async (parent, args, context) =>
    permissionHelper.getPermissionsForQuery(commonHelper.prepareRequestForQuery(args, context))
}
