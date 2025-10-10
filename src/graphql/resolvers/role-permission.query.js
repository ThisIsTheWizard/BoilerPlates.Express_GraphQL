import { rolePermissionHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const rolePermissionQuery = {
  getRolePermissions: async () =>
    await useTransaction(async (transaction) => rolePermissionHelper.getRolePermissions({}, transaction)),

  getARolePermission: async (_, { id }) =>
    await useTransaction(async (transaction) =>
      rolePermissionHelper.getARolePermission({ where: { id } }, transaction)
    ),

  getRolePermissionsByRole: async (_, { role_id }) =>
    await useTransaction(async (transaction) =>
      rolePermissionHelper.getRolePermissions({ where: { role_id } }, transaction)
    )
}
