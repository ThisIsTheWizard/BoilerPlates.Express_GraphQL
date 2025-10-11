// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Services
import { commonService, roleUserService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createAUser = async (data, options, transaction) => UserEntity.create(data, { ...options, transaction })

export const updateAUser = async (options, data, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.update(data, { transaction })

  return user
}

export const deleteAUser = async (options, transaction) => {
  const user = await UserEntity.findOne({ ...options, transaction })
  if (!user?.id) {
    throw new CustomError(404, 'USER_NOT_FOUND')
  }

  await user.destroy({ transaction })

  return user
}

export const createAUserForMutation = async (params = {}, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'email', required: true, type: 'string' },
      { field: 'first_name', required: true, type: 'string' },
      { field: 'last_name', required: true, type: 'string' }
    ],
    params
  )

  const { email, first_name, last_name } = params || {}

  // Ensure user does not already exist
  const existing = await UserEntity.findOne({ where: { email } }, transaction)
  if (existing?.id) {
    throw new Error('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
  }

  // Auto-generate a secure password and create user in unverified state
  const generatedPassword = commonHelper.getRandomString(16)
  const user = await createAUser(
    {
      email,
      first_name,
      last_name,
      password: commonService.generateHashPassword(generatedPassword),
      status: 'unverified'
    },
    null,
    transaction
  )

  // Assign default role
  await roleUserService.assignARoleToUserByName({ role_name: 'user', user_id: user?.id }, transaction)

  return user
}

export const updateAUserForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'data', required: true, type: 'object' }
    ],
    params
  )
  commonHelper.validateProps(
    [
      { field: 'email', required: false, type: 'string' },
      { field: 'first_name', required: false, type: 'string' },
      { field: 'last_name', required: false, type: 'string' },
      { field: 'status', required: false, type: 'string' }
    ],
    params?.data
  )

  return updateAUser({ where: { id: params?.entity_id } }, params?.data, transaction)
}

export const deleteAUserForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteAUser({ where: { id: params?.entity_id } }, transaction)
}
