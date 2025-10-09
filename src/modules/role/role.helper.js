import { head, intersection, size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RoleEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'
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

export const getARoleForQuery = async (params) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  const role = await getARole({
    include: [
      {
        association: 'permissions',
        attributes: [
          'id',
          'action',
          'module',
          [sequelize.literal('"permissions->role_permissions"."can_do_the_action"'), 'can_do_the_action'],
          [sequelize.literal('"permissions->role_permissions"."id"'), 'role_permission_id']
        ],
        through: { attributes: ['id', 'can_do_the_action'] }
      }
    ],
    order: [
      ['permissions', 'module', 'ASC'],
      ['permissions', 'action', 'ASC']
    ],
    where: { id: params?.entity_id }
  })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  return JSON.parse(JSON.stringify(role))
}

export const getRolesForQuery = async (query, options) => {
  const { limit, offset, order } = options || {}

  const where = prepareRoleQuery(query)
  const data = await getRoles({
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
