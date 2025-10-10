import { permissionService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createPermission: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      permissionService.createAPermissionForMutation(args?.input, context?.user, transaction)
    ),

  updatePermission: async (parent, args) =>
    await useTransaction(async (transaction) =>
      permissionService.updateAPermissionForMutation(args?.input, transaction)
    ),

  deletePermission: async (parent, args) =>
    await useTransaction(async (transaction) => permissionService.deleteAPermissionForMutation(args, transaction))
}
