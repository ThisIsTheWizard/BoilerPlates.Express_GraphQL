import { commonHelper, roleHelper } from 'src/modules/helpers'

export default {
  getARole: async (parent, args) => roleHelper.getARoleForQuery(args),
  getRoles: async (parent, args, context) =>
    roleHelper.getRolesForQuery(commonHelper.prepareRequestForQuery(args, context))
}
