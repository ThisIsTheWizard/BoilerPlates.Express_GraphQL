import { userService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createUser: async (_, { input }) =>
    await useTransaction(async (transaction) => userService.createAUser(input, {}, transaction)),

  updateUser: async (_, { input }) => {
    const { id, ...data } = input
    return await useTransaction(async (transaction) => userService.updateAUser({ where: { id } }, data, transaction))
  },

  deleteUser: async (_, { id }) => {
    await useTransaction(async (transaction) => userService.deleteAUser({ where: { id } }, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
