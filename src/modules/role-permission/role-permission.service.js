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

export const updateARolePermission = async (options, data, transaction) => {
  const rolePermission = await rolePermissionHelper.getARolePermission(options, transaction)
  if (!rolePermission?.id) {
    throw new CustomError(404, 'ROLE_PERMISSION_NOT_FOUND')
  }

  await rolePermission.update(data, { transaction })

  return rolePermission
}

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
      { field: 'can_do_the_action', required: true, type: 'boolean' },
      { field: 'permission_id', required: true, type: 'string' },
      { field: 'role_id', required: true, type: 'string' }
    ],
    params
  )

  const { can_do_the_action, permission_id, role_id } = params || {}

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
    throw new CustomError(400, 'ROLE_PERMISSION_ALREADY_EXISTS')
  }

  const rolePermission = await createARolePermission(
    { can_do_the_action, permission_id, role_id, created_by: user.id },
    null,
    transaction
  )

  return rolePermission
}

export const updateARolePermissionForMutation = async (params, user, transaction) => {
  commonHelper.validateProps(
    [
      { field: 'entity_id', required: true, type: 'string' },
      { field: 'can_do_the_action', required: true, type: 'boolean' }
    ],
    params
  )

  const { entity_id, can_do_the_action } = params || {}

  return updateARolePermission(
    { where: { id: entity_id } },
    { can_do_the_action, updated_by: user?.user_id },
    transaction
  )
}

export const deleteARolePermissionForMutation = async (params, transaction) => {
  commonHelper.validateProps([{ field: 'entity_id', required: true, type: 'string' }], params)

  return deleteARolePermission({ where: { id: params?.entity_id } }, transaction)
}
