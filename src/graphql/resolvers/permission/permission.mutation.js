import { permissionService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  createPermission: async (_, { input }, { user }) =>
    await useTransaction(async (transaction) =>
      permissionService.createAPermissionForMutation(input, user, transaction)
    ),

  updatePermission: async (_, { input }) => {
    const { id, ...data } = input
    return await useTransaction(async (transaction) =>
      permissionService.updateAPermissionForMutation({ entity_id: id, data }, transaction)
    )
  },

  deletePermission: async (_, { id }) => {
    await useTransaction(async (transaction) =>
      permissionService.deleteAPermissionForMutation({ entity_id: id }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  }
}
