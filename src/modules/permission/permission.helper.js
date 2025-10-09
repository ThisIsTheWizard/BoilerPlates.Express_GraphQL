import { size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { PermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const countPermissions = async (options, transaction) => PermissionEntity.count({ ...options, transaction })

export const getAPermission = async (options, transaction) => PermissionEntity.findOne({ ...options, transaction })

export const getPermissions = async (options, transaction) => PermissionEntity.findAll({ ...options, transaction })

export const preparePermissionQuery = (params = {}) => {
  const query = {}

  if (params?.action) query.action = params?.action
  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query.id = {
      [Op.and]: [
        ...(size(params?.exclude_entity_ids) ? [{ [Op.notIn]: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ [Op.in]: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.module) query.module = params?.module

  return query
}

export const getPermissionAssociation = (where = {}) => [
  {
    association: 'roles',
    attributes: [
      'id',
      'name',
      [sequelize.literal('"roles->role_permissions"."can_do_the_action"'), 'can_do_the_action'],
      [sequelize.literal('"roles->role_permissions"."id"'), 'role_permission_id']
    ],
    through: { attributes: ['id', 'can_do_the_action'], where }
  }
]

export const getAPermissionForQuery = async (query) => {
  commonHelper.validateRequiredProps(['entity_id'], query)

  const permission = await getAPermission({
    include: getPermissionAssociation(),
    where: { id: query.entity_id }
  })
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_DOES_NOT_EXIST')
  }

  return permission
}

export const getPermissionsForQuery = async (query, options) => {
  const { limit, offset, order } = options || {}

  const where = preparePermissionQuery(query)
  const rolePermissionQuery = rolePermissionHelper.prepareRolePermissionQuery(query)

  const include = getPermissionAssociation(rolePermissionQuery)
  const permissions = await getPermissions({
    include,
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countPermissions({ distinct: true, include, where })
  const total_rows = await countPermissions({ distinct: true, where: {} })

  return { data: JSON.parse(JSON.stringify(permissions)), meta_data: { filtered_rows, total_rows } }
}
