// Entities
import { AuthTemplateEntity } from 'src/modules/entities'

// Helpers
import { authTemplateHelper } from 'src/modules/helpers'

// Services
import {} from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAnAuthTemplate = async (data, options, transaction) =>
  AuthTemplateEntity.create(data, { ...options, transaction })

export const updateAnAuthTemplate = async (options, data, transaction) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate(options, transaction)
  if (!authTemplate?.id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  await authTemplate.update(data, { transaction })

  return authTemplate
}

export const deleteAnAuthTemplate = async (options, transaction) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate(options, transaction)
  if (!authTemplate?.id) {
    throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')
  }

  await authTemplate.destroy({ transaction })

  return authTemplate
}

export const createAnAuthTemplateForMutation = async (params, user, transaction) => {
  const { body, event, subject, title } = params || {}

  const authTemplate = await createAnAuthTemplate({ body, event, subject, title }, null, transaction)
  if (!authTemplate?.id) {
    throw new CustomError(500, 'COULD_NOT_CREATE_AUTH_TEMPLATE')
  }

  return authTemplate
}

export const updateAnAuthTemplateForMutation = async (params, user, transaction) => {
  const { queryData, inputData } = params || {}
  const { body, event, subject, title } = inputData || {}

  const authTemplate = await authTemplateHelper.getAnAuthTemplate(
    { where: { id: queryData?.entity_id || null } },
    transaction
  )
  if (!authTemplate?.id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  const updateData = {}
  if (body) updateData.body = body
  if (event) updateData.event = event
  if (subject) updateData.subject = subject
  if (title) updateData.title = title

  await authTemplate.update(updateData, { transaction })

  return authTemplate
}

export const removeAnAuthTemplateForMutation = async (query, user, transaction) => {
  const authTemplate = await authTemplateHelper.getAnAuthTemplate({
    where: { id: query?.entity_id }
  })
  if (!authTemplate?.id) throw new CustomError(404, 'AUTH_TEMPLATE_NOT_FOUND')

  await authTemplate.destroy({ transaction })

  return authTemplate
}
