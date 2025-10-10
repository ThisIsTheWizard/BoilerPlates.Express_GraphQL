import { commonHelper, roleUserHelper } from 'src/modules/helpers'

export default {
  getARoleUser: async (parent, args) => roleUserHelper.getARoleUserForQuery(args),
  getRoleUsers: async (parent, args, context) =>
    roleUserHelper.getRoleUsersForQuery(commonHelper.prepareRequestForQuery(args, context))
}
