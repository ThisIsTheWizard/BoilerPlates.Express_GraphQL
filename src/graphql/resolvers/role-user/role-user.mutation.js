import { roleUserService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignRole: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      roleUserService.createARoleUserForMutation(args?.input, context?.user, transaction)
    ),

  updateRoleUser: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      roleUserService.updateARoleUserForMutation(args?.input, context?.user, transaction)
    ),

  removeRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.deleteARoleUserForMutation(args, transaction))
}
