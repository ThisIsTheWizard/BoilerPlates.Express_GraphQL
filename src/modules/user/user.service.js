// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers

// Services

// Utils
import { CustomError } from 'src/utils/error'

import { commonHelper } from '../helpers'

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
