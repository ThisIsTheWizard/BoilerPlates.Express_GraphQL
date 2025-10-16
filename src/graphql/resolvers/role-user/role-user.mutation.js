import { roleUserService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.createARoleUserForMutation(args?.input, transaction)),

  revokeRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleUserService.deleteARoleUserForMutation(args?.input, transaction))
}
