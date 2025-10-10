import { roleHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const roleQuery = {
  getRoles: async () => await useTransaction(async (transaction) => roleHelper.getRoles({}, transaction)),

  getARole: async (_, { id }) =>
    await useTransaction(async (transaction) => roleHelper.getARole({ where: { id } }, transaction))
}
