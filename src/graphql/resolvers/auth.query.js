import { userHelper } from 'src/modules/helpers'
import { useTransaction } from 'src/utils/database'

export const authQuery = {
  me: async (_, __, { user }) =>
    await useTransaction(async (transaction) => userHelper.getAUser({ where: { id: user.user_id } }, transaction))
}
