import { roleService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createRole: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      roleService.createARoleForMutation(args?.input, context?.user, transaction)
    ),

  updateRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleService.updateARoleForMutation(args?.input, transaction)),

  deleteRole: async (parent, args) =>
    await useTransaction(async (transaction) => roleService.deleteARoleForMutation(args, transaction))
}
