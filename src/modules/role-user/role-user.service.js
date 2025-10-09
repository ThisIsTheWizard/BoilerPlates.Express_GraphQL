import {} from 'lodash'

// Entities
import { RoleUserEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, roleHelper, roleUserHelper } from 'src/modules/helpers'

// Services
import { roleUserService } from 'src/modules/services'

// Utils
import { CustomError } from 'src/utils/error'

import {} from 'lodash'

// Entities

// Helpers
import { userHelper } from 'src/modules/helpers'

// Services

// Utils

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

export const updateARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'data', required: true, type: 'object' }
    ],
    params
  )
  commonHelper.validateProps(
    [
      { field: 'role_id', required: true, type: 'string' },
      { field: 'user_id', required: true, type: 'string' }
    ],
    params?.data
  )

  const { entity_id, data } = params || {}
  const { role_id, user_id } = data || {}

  const roleUser = await roleUserHelper.getARoleUser({ where: { id: entity_id } }, transaction)
  if (!roleUser?.id) {
    throw new CustomError(404, 'ROLE_USER_DOES_NOT_EXIST')
  }

  if (role_id) {
    const role = await roleHelper.getARole({ where: { id: role_id } }, transaction)
    if (!role?.id) {
      throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
    }
  }
  if (user_id) {
    const user = await userHelper.getAUser({ where: { id: user_id } }, transaction)
    if (!user?.id) {
      throw new CustomError(404, 'USER_DOES_NOT_EXIST')
    }
  }

  const existingRoleUser = await roleUserHelper.getARoleUser(
    { where: { role_id: role_id || roleUser?.role_id, user_id: user_id || roleUser?.user_id } },
    transaction
  )
  if (existingRoleUser?.id) {
    throw new CustomError(400, 'ROLE_USER_ALREADY_EXISTS')
  }

  await roleUser.update(params?.data, { transaction })

  return roleUser
}

export const deleteARoleUserForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteARoleUser({ where: { id: params?.entity_id } }, transaction)
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
