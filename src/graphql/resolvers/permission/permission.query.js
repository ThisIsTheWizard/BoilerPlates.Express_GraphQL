import { permissionHelper } from 'src/modules/helpers'

export default {
  getPermissions: async () => permissionHelper.getPermissions({}),
  getAPermission: async (_, { id }) => permissionHelper.getAPermission({ where: { id } })
}
