import { permissionService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createPermission: async (_, { input }) =>
    await useTransaction(async (transaction) => permissionService.createAPermission(input, {}, transaction)),

  updatePermission: async (_, { input }) => {
    const { id, ...data } = input
    return await useTransaction(async (transaction) =>
      permissionService.updateAPermission({ where: { id } }, data, transaction)
    )
  },

  deletePermission: async (_, { id }) => {
    await useTransaction(async (transaction) => permissionService.deleteAPermission({ where: { id } }, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
