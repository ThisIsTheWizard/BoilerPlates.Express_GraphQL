import { rolePermissionService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignPermission: async (_, { input }) =>
    await useTransaction(async (transaction) => rolePermissionService.createARolePermission(input, {}, transaction)),

  removePermission: async (_, { id }) => {
    await useTransaction(async (transaction) =>
      rolePermissionService.deleteARolePermission({ where: { id } }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  }
}
