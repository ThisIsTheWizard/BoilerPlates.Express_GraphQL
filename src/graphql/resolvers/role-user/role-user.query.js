import { roleUserHelper } from 'src/modules/helpers'

export default {
  getRoleUsers: async () => roleUserHelper.getRoleUsers({}),
  getARoleUser: async (_, { id }) => roleUserHelper.getARoleUserForQuery({ entity_id: id }),
  getUserRoles: async (_, { user_id }) => roleUserHelper.getRoleUsers({ where: { user_id } })
}
