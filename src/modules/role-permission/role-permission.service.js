// Entities
import { RolePermissionEntity } from 'src/modules/entities'

// Helpers
import { commonHelper, permissionHelper, roleHelper, rolePermissionHelper } from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const createARolePermission = async (data, options, transaction) =>
  RolePermissionEntity.create(data, { ...options, transaction })

export const createRolePermissions = async (data, options, transaction) =>
  RolePermissionEntity.bulkCreate(data, { ...options, transaction })

export const deleteARolePermission = async (options, transaction) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, transaction)
  if (!rolePermission?.id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  await rolePermission.destroy({ transaction })

  return rolePermission
}

export const createARolePermissionForMutation = async (params, user, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'permission_id', required: true, type: 'string' },
      { field: 'role_id', required: true, type: 'string' }
    ],
    params
  )

  const { permission_id, role_id } = params || {}

  const role = await roleHelper.getARole({ where: { id: role_id } }, transaction)
  if (!role?.id) {
    throw new CustomError(404, 'ROLE_DOES_NOT_EXIST')
  }

  const permission = await permissionHelper.getAPermission({ where: { id: permission_id } }, transaction)
  if (!permission?.id) {
    throw new CustomError(404, 'PERMISSION_DOES_NOT_EXIST')
  }

  const existingRolePerm = await rolePermissionHelper.getARolePermission(
    { where: { permission_id, role_id } },
    transaction
  )
  if (existingRolePerm?.id) {
    return existingRolePerm
  }

  const rolePermission = await createARolePermission(
    { permission_id, role_id, created_by: user?.user_id },
    null,
    transaction
  )

  return rolePermission
}

export const deleteARolePermissionForMutation = async (where, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'permission_id', required: true, type: 'string' },
      { field: 'role_id', required: true, type: 'string' }
    ],
    where
  )

  return deleteARolePermission({ where }, transaction)
}
