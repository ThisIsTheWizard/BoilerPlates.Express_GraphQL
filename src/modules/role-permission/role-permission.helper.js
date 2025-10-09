import { isBoolean, size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RolePermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRolePermissions = async (options) => RolePermissionEntity.count(options)

export const getARolePermission = async (options, transaction) =>
  RolePermissionEntity.findOne({ ...options, transaction })

export const getRolePermissions = async (options, transaction) =>
  RolePermissionEntity.findAll({ ...options, transaction })

export const prepareRolePermissionQuery = (params) => {
  const query = {}

  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query.id = {
      [Op.and]: [
        ...(size(params?.exclude_entity_ids) ? [{ [Op.notIn]: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ [Op.in]: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.role_id) {
    query.role_id = params.role_id
  }
  if (params?.permission_id) {
    query.permission_id = params.permission_id
  }
  if (isBoolean(params?.can_do_the_action)) {
    query.can_do_the_action = params.can_do_the_action
  }

  return query
}

export const getARolePermissionForQuery = async (params) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  const rolePermission = await getARolePermission({
    include: [{ association: 'permission' }, { association: 'role' }],
    where: { id: params?.entity_id }
  })
  if (!rolePermission?.id) {
    throw new CustomError(404, 'ROLE_PERMISSION_DOES_NOT_EXIST')
  }

  return rolePermission
}

export const getRolePermissionsForQuery = async (params, options) => {
  const { limit, offset, order } = options || {}

  const where = prepareRolePermissionQuery(params)
  const data = await getRolePermissions({
    include: [{ association: 'permission' }, { association: 'role' }],
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countRolePermissions({ distinct: true, where })
  const total_rows = await countRolePermissions({})

  return { data, meta_data: { filtered_rows, total_rows } }
}
