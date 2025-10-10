import { roleUserHelper } from 'src/modules/helpers'

export default {
  getRoleUsers: async () => roleUserHelper.getRoleUsers({}),
  getARoleUser: async (_, { id }) => roleUserHelper.getARoleUser({ where: { id } }),
  getUserRoles: async (_, { user_id }) => roleUserHelper.getRoleUsers({ where: { user_id } })
}
