import { roleHelper } from 'src/modules/helpers'

export default {
  getARole: async (_, { id }) => roleHelper.getARoleForQuery({ entity_id: id }),
  getRoles: async (_, input) => roleHelper.getRolesForQuery(input)
}
