// Entities
import { PermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createAPermission = async (data, options, transaction) =>
  PermissionEntity.create(data, { ...options, transaction })

export const createPermissions = async (data, options, transaction) =>
  PermissionEntity.bulkCreate(data, { ...options, transaction })

export const updateAPermission = async (options, data, transaction) => {
  const permission = await PermissionEntity.findOne({ ...options, transaction })
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  await permission.update(data, { transaction })

  return permission
}

export const deleteAPermission = async (options, transaction) => {
  const permission = await PermissionEntity.findOne({ ...options, transaction })
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_NOT_FOUND')
  }

  await permission.destroy({ transaction })

  return permission
}

export const createAPermissionForMutation = async (params, user, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'action', required: true, type: 'string' },
      { field: 'module', required: true, type: 'string' }
    ],
    params
  )

  const { action, module } = params || {}

  return createAPermission({ action, created_by: user?.user_id, module }, null, transaction)
}

export const updateAPermissionForMutation = async (params, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'data', required: true, type: 'object' }
    ],
    params
  )
  commonHelper.validateProps(
    [
      { field: 'action', required: false, type: 'string' },
      { field: 'module', required: false, type: 'string' }
    ],
    params?.data
  )

  return updateAPermission({ where: { id: params?.entity_id } }, params?.data, transaction)
}

export const deleteAPermissionForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteAPermission({ where: { id: params?.entity_id } }, transaction)
}
