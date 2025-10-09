import { size } from 'lodash'
import { Op } from 'sequelize'

// Entities
import { AuthTokenEntity } from 'src/modules/entities'

// Utils
import { CustomError } from 'src/utils/error'

export const countAuthTokens = async (options) => AuthTokenEntity.count(options)

export const getAnAuthToken = async (options, transaction) => AuthTokenEntity.findOne({ ...options, transaction })

export const getAuthTokens = async (options, transaction) => AuthTokenEntity.findAll({ ...options, transaction })

export const prepareAuthTokenQuery = (params = {}) => {
  const query = {}

  if (params?.access_token) query.access_token = params.access_token
  if (size(params?.exclude_entity_ids) || size(params?.include_entity_ids)) {
    query.id = {
      [Op.and]: [
        ...(size(params?.exclude_entity_ids) ? [{ [Op.notIn]: params?.exclude_entity_ids }] : []),
        ...(size(params?.include_entity_ids) ? [{ [Op.in]: params?.include_entity_ids }] : [])
      ]
    }
  }
  if (params?.refresh_token) query.refresh_token = params.refresh_token
  if (params?.user_id) query.user_id = params.user_id

  return query
}

export const getAnAuthTokenForQuery = async (params) => {
  const where = prepareAuthTokenQuery(params)
  const authToken = await getAnAuthToken({ where })
  if (!authToken?._id) {
    throw new CustomError(404, 'AUTH_TOKEN_NOT_FOUND')
  }

  return authToken
}

export const getAuthTokensForQuery = async (params) => {
  const { options = {}, query = {} } = params || {}
  const { limit, offset, order } = options || {}

  const where = prepareAuthTokenQuery(query)
  const data = await getAuthTokens({
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countAuthTokens({ where })
  const total_rows = await countAuthTokens({ where: {} })

  return { data, meta_data: { filtered_rows, total_rows } }
}
