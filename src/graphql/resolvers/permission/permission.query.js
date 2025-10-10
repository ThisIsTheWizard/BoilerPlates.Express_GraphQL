import { permissionHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const permissionQuery = {
  getPermissions: async () =>
    await useTransaction(async (transaction) => permissionHelper.getPermissions({}, transaction)),

  getAPermission: async (_, { id }) =>
    await useTransaction(async (transaction) => permissionHelper.getAPermission({ where: { id } }, transaction))
}
