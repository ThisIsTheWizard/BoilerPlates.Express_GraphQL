import { roleUserHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const roleUserQuery = {
  getRoleUsers: async () => await useTransaction(async (transaction) => roleUserHelper.getRoleUsers({}, transaction)),

  getARoleUser: async (_, { id }) =>
    await useTransaction(async (transaction) => roleUserHelper.getARoleUser({ where: { id } }, transaction)),

  getUserRoles: async (_, { user_id }) =>
    await useTransaction(async (transaction) => roleUserHelper.getRoleUsers({ where: { user_id } }, transaction))
}
