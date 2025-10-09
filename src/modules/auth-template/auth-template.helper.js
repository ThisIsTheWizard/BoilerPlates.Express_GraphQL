import { Op } from 'sequelize'

// Entities
import { AuthTemplateEntity } from 'src/modules/entities'

// Helpers
import {} from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const getAnAuthTemplate = async (options, transaction) => AuthTemplateEntity.findOne({ ...options, transaction })

export const getAuthTemplates = async (options, transaction) => AuthTemplateEntity.findAll({ ...options, transaction })

export const countAuthTemplates = async (options) => AuthTemplateEntity.count(options)

export const prepareAuthTemplateQuery = (params = {}) => {
  const query = {}

  if (params?.entity_id) query.id = params.entity_id
  if (params?.event) query.event = params.event
  if (params?.search_keyword) {
    const searchPattern = { [Op.iLike]: '%' + params.search_keyword + '%' }
    query[Op.or] = [
      { body: searchPattern },
      { event: searchPattern },
      { subject: searchPattern },
      { title: searchPattern }
    ]
  }
  if (params?.subject) query.subject = { [Op.iLike]: '%' + params.subject + '%' }
  if (params?.title) query.title = { [Op.iLike]: '%' + params.title + '%' }

  return query
}

export const getAnAuthTemplateForQuery = async (params) => {
  const query = prepareAuthTemplateQuery(params)
  const authTemplate = await getAnAuthTemplate({ where: query })
  if (!authTemplate?.id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  return authTemplate
}

export const getAuthTemplatesForQuery = async (params) => {
  const { options = {}, query = {} } = params || {}
  const { limit, offset, order } = options || {}

  const where = prepareAuthTemplateQuery(query)
  const authTemplates = await getAuthTemplates({
    limit,
    offset,
    order,
    where
  })
  const filtered_rows = await countAuthTemplates({ where })
  const total_rows = await countAuthTemplates({ where: {} })

  return { data: authTemplates, meta_data: { filtered_rows, total_rows } }
}
