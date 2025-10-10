// Entities
import { UserEntity } from 'src/modules/entities'

// Helpers

// Services

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
