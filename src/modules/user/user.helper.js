import { find, join, map, size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, roleHelper } from 'src/modules/helpers'

// Utils
import { sequelize } from 'src/utils/database'

export const countUsers = async (options) => UserEntity.count(options)

export const getAUser = async (options, transaction) => UserEntity.findOne({ ...options, transaction })

export const getUsers = async (options, transaction) => UserEntity.findAll({ ...options, transaction })

export const prepareGetUsersQuery = (params) => {
  const { email, search_keyword, status } = params || {}

  const query = {}
  if (email) query.email = email?.toLowerCase?.()
  if (search_keyword) {
    query[Op.or] = [
      { email: { [Op.iLike]: '%' + search_keyword + '%' } },
      sequelize.where(sequelize.literal("CONCAT(first_name, ' ', last_name)"), Op.iLike, '%' + search_keyword + '%')
    ]
  }
  if (status) query.status = status

  return query
}

export const getAUserForQuery = async (query) => {
  commonHelper.checkRequiredFields(['entity_id'], query)

  return getAUser({ attributes: ['id', 'email', 'first_name', 'last_name', 'status'], where: { id: query.entity_id } })
}

export const getUsersForQuery = async (params) => {
  const { options, query } = params || {}
  const { limit, offset, order } = options || {}

  const where = prepareGetUsersQuery(query)
  const data = await getUsers({
    attributes: ['id', 'email', 'first_name', 'last_name', 'status'],
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countUsers({ where })
  const total_rows = await countUsers({})

  return { data, meta_data: { filtered_rows, total_rows } }
}

export const getAuthUserWithRolesAndPermissions = async ({ roles, user_id }) => {
  if (!commonHelper.validateUUID(user_id)) {
    throw new Error('INVALID_USER_ID')
  }

  const user = await getAUser({
    attributes: ['id', 'email', 'first_name', 'last_name', 'status'],
    include: [
      { association: 'roles', include: [{ association: 'permissions' }], where: { name: { [Op.in]: roles || [] } } }
    ],
    where: { id: user_id }
  })
  if (!user?.id) {
    throw new Error('USER_DOES_NOT_EXIST')
  }

  const result = JSON.parse(JSON.stringify(user))

  result.roles = map(user?.roles, 'name')
  result.role = roleHelper.getTopRoleOfAUser(user.roles || [])
  result.permissions = find(user?.roles, (role) => role?.name === user.role)?.permissions || []
  result.user_id = user.id

  return result
}

export const getUsernameByNames = (email, first_name, last_name) => {
  const strings = []

  if (first_name) strings.push(first_name)
  if (last_name) strings.push(last_name)

  // If names are empty, use email as username
  if (email && !size(strings)) {
    strings.push(email)
  }

  return join(strings, ' ')
}
