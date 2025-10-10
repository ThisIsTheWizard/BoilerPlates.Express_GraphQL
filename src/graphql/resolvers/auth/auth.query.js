import { userHelper } from 'src/modules/helpers'

export default {
  user: async (_, __, { user }) => userHelper.getAUser({ where: { id: user.user_id } })
}
