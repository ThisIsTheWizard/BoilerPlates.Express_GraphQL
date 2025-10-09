// Entities
import { RoleEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Services

// Utils
import { CustomError } from 'src/utils/error'

export const createARole = async (data, options, transaction) => RoleEntity.create(data, { ...options, transaction })

export const createRoles = async (data, options, transaction) =>
  RoleEntity.bulkCreate(data, { ...options, transaction })

export const updateARole = async (options, data, transaction) => {
  const role = await RoleEntity.findOne({ ...options, transaction })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  await role.update(data, { transaction })

  return role
}

export const deleteARole = async (options, transaction) => {
  const role = await RoleEntity.findOne({ ...options, transaction })
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_NOT_FOUND')
  }

  await role.destroy({ transaction })

  return role
}

export const createARoleForMutation = async (params, user, transaction) => {
  commonHelper.validateProps([{ field: 'name', required: true, type: 'string' }], params)

  return createARole({ created_by: user?.user_id, name: params?.name }, null, transaction)
}

export const updateARoleForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'data', required: true, type: 'object' }
    ],
    params
  )
  commonHelper.validateProps([{ field: 'name', required: false, type: 'string' }], params?.data)

  return updateARole({ where: { id: params?.entity_id } }, params?.data, transaction)
}

export const deleteARoleForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteARole({ where: { id: params?.entity_id } }, transaction)
}
