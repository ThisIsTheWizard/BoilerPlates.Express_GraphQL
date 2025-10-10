import { userHelper } from 'src/modules/helpers'

export default {
  getAUser: async (_, { id }) => userHelper.getAUserForQuery({ entity_id: id }),
  getUsers: async () => userHelper.getUsers({})
}
