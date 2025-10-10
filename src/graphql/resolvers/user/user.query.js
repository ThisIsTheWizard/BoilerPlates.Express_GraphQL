import { userHelper } from 'src/modules/helpers'

export default {
  getAUser: async (_, { id }) => userHelper.getAUser({ where: { id } }),
  getUsers: async () => userHelper.getUsers({})
}
