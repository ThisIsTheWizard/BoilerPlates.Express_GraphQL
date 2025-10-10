import { roleHelper } from 'src/modules/helpers'

export default {
  getRoles: async () => roleHelper.getRoles({}),
  getARole: async (_, { id }) => roleHelper.getARole({ where: { id } })
}
