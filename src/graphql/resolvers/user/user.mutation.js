import { authService, userService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createUser: async (parent, args, context) =>
    await useTransaction(async (transaction) => authService.registerUser(args?.input, context?.user, transaction)),

  updateUser: async (parent, args) =>
    await useTransaction(async (transaction) => userService.updateAUserForMutation(args?.input, transaction)),

  deleteUser: async (parent, args) =>
    await useTransaction(async (transaction) => userService.deleteAUserForMutation(args, transaction))
}
