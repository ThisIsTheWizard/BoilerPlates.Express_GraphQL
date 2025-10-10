import { permissionHelper } from 'src/modules/helpers'

export default {
  getPermissions: async () => permissionHelper.getPermissions({}),
  getAPermission: async (_, { id }) => permissionHelper.getAPermissionForQuery({ entity_id: id })
}
