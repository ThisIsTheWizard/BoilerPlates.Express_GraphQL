import { roleService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createRole: async (_, { input }) =>
    await useTransaction(async (transaction) => roleService.createARole(input, {}, transaction)),

  updateRole: async (_, { input }) => {
    const { id, ...data } = input
    return await useTransaction(async (transaction) => roleService.updateARole({ where: { id } }, data, transaction))
  },

  deleteRole: async (_, { id }) => {
    await useTransaction(async (transaction) => roleService.deleteARole({ where: { id } }, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
