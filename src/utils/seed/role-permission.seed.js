import { PermissionEntity, RoleEntity, RolePermissionEntity } from 'src/modules/entities'

export const seedRolePermissions = async () => {
  const roles = await RoleEntity.findAll({})
  const permissions = await PermissionEntity.findAll({})

  const rolePermissions = []
  for (const role of roles) {
    if (['admin', 'developer'].includes(role?.name)) {
      for (const permission of permissions) {
        rolePermissions.push({
          permission_id: permission.id,
          role_id: role.id
        })
      }
    }
  }

  return RolePermissionEntity.bulkCreate(rolePermissions, { ignoreDuplicates: true })
}
