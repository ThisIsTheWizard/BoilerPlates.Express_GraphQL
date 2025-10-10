import { commonHelper, userHelper } from 'src/modules/helpers'

export default {
  getAUser: async (parent, args) => userHelper.getAUserForQuery(args),
  getUsers: async (parent, args, context) =>
    userHelper.getUsersForQuery(commonHelper.prepareRequestForQuery(args, context))
}
