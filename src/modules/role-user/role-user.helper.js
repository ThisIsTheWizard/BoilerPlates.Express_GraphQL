import { size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { RoleUserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const countRoleUsers = async (options) => RoleUserEntity.count(options)

export const getARoleUser = async (options, transaction) => RoleUserEntity.findOne({ ...options, transaction })

export const getRoleUsers = async (options, transaction) => RoleUserEntity.findAll({ ...options, transaction })

export const prepareRoleUserQuery = (params) => {
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
  if (params?.user_id) {
    query.user_id = params.user_id
  }

  return query
}

export const getARoleUserForQuery = async (query) => {
  commonHelper.validateRequiredProps(['entity_id'], query)

  const roleUser = await getARoleUser({ where: { id: query.entity_id } })
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_DOES_NOT_EXIST')
  }

  return roleUser
}

export const getRoleUsersForQuery = async (params) => {
  const { options, query } = params || {}
  const { limit, offset, order } = options || {}

  const where = prepareRoleUserQuery(query)
  const data = await getRoleUsers({
    include: [{ association: 'role' }, { association: 'user' }],
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countRoleUsers({ distinct: true, where })
  const total_rows = await countRoleUsers({})

  return { data, meta_data: { filtered_rows, total_rows } }
}
