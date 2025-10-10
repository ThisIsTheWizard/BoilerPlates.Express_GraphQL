import { userHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const userQuery = {
  getUsers: async () => await useTransaction(async (transaction) => userHelper.getUsers({}, transaction)),

  getAUser: async (_, { id }) =>
    await useTransaction(async (transaction) => userHelper.getAUser({ where: { id } }, transaction))
}
