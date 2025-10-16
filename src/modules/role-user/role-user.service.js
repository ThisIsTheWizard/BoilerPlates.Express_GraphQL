// Entities
import { RoleUserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, roleHelper, roleUserHelper, userHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

export const createARoleUser = async (data, options, transaction) =>
  RoleUserEntity.create(data, { ...options, transaction })

export const updateARoleUser = async (options, data, transaction) => {
  const roleUser = await RoleUserEntity.findOne({ ...options, transaction })
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  await roleUser.update(data, { transaction })

  return roleUser
}

export const deleteARoleUser = async (options, transaction) => {
  const roleUser = await RoleUserEntity.findOne({ ...options, transaction })
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_NOT_FOUND')
  }

  await roleUser.destroy({ transaction })

  return roleUser
}

export const createARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'role_id', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params
  )

  const { role_id, user_id } = params || {}

  const role = await roleHelper.getARole({ where: { id: role_id } }, transaction)
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
  if (!user?.id) {
    throw new CustomError(404, 'USER_DOES_NOT_EXIST')
  }

  const existingRoleUser = await roleUserHelper.getARoleUser({ where: { role_id, user_id } }, transaction)
  if (existingRoleUser?.id) {
    throw new CustomError(400, 'ROLE_USER_ALREADY_EXISTS')
  }

  return createARoleUser({ role_id, user_id }, null, transaction)
}

export const deleteARoleUserForMutation = async (where, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'role_id', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    where
  )

  return deleteARoleUser({ where }, transaction)
}

export const assignARoleToUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const roleUserCreationData = { user_id: params?.user_id }

  const role = await roleHelper.getARole({ where: { name: params?.role_name } }, transaction)
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  roleUserCreationData.role_id = role.id

  return createARoleUser(roleUserCreationData, null, transaction)
}

export const revokeARoleFromUserByName = async (params, transaction) => {
  commonHelper.validateRequiredProps(['role_name', 'user_id'], params)

  const role = await roleHelper.getARole({ where: { name: params?.role_name } })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const removedRoleUser = await roleUserService.deleteARoleUser(
    { where: { user_id: params?.user_id, role_id: role?.id } },
    transaction
  )
  if (!removedRoleUser?.id) {
    throw new CustomError(500, 'COULD_NOT_REMOVE_ROLE_USER')
  }

  return removedRoleUser
}
