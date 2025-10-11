import { roleUserService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.createARoleUserForMutation(args?.input, transaction)),

  updateRoleUser: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.updateARoleUserForMutation(args?.input, transaction)),

  removeRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.deleteARoleUserForMutation(args, transaction))
}
