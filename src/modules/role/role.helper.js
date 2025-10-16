import { head, intersection, size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RoleEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoles = async (options) => RoleEntity.count(options)

export const getARole = async (options, transaction) => RoleEntity.findOne({ ...options, transaction })

export const getRoles = async (options, transaction) => RoleEntity.findAll({ ...options, transaction })

export const prepareRoleQuery = (params = {}) => {
  const query = {}

  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query.id = {
      [Op.and]: [
        ...(size(params?.exclude_entity_ids) ? [{ [Op.notIn]: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ [Op.in]: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (size(params?.names)) {
    query.name = { [Op.in]: params.names }
  }

  return query
}

export const getRoleAssociation = () => [{ association: 'permissions' }, { association: 'users' }]

export const getARoleForQuery = async (query) => {
  commonHelper.validateRequiredProps(['entity_id'], query)

  const role = await getARole({
    include: getRoleAssociation(),
    where: { id: query.entity_id }
  })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  return JSON.parse(JSON.stringify(role))
}

export const getRolesForQuery = async (params) => {
  const { options, query } = params || {}
  const { limit, offset, order } = options || {}

  const where = prepareRoleQuery(query)
  const data = await getRoles({
    include: getRoleAssociation(),
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countRoles({ where })
  const total_rows = await countRoles({ where: {} })

  return { data, meta_data: { filtered_rows, total_rows } }
}

export const getTopRoleOfAUser = (roles = []) => head(intersection(['admin', 'developer', 'moderator', 'user'], roles))
