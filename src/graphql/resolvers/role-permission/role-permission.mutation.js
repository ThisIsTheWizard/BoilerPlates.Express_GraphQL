import { rolePermissionService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  assignPermission: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      rolePermissionService.createARolePermissionForMutation(args?.input, context?.user, transaction)
    ),

  revokePermission: async (parent, args) =>
    await useTransaction(async (transaction) =>
      rolePermissionService.deleteARolePermissionForMutation(args?.input, transaction)
    )
}
