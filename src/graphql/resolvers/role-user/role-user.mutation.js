import { roleUserService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignRole: async (_, { input }) =>
    await useTransaction(async (transaction) => roleUserService.createARoleUser(input, {}, transaction)),

  removeRole: async (_, { id }) => {
    await useTransaction(async (transaction) => roleUserService.deleteARoleUser({ where: { id } }, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
