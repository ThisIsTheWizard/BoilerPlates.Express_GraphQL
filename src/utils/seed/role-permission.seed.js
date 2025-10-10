import { PermissionEntity, RoleEntity, RolePermissionEntity } from 'src/modules/entities'

export const seedRolePermissions = async () => {
  const roles = await RoleEntity.findAll({})
  const permissions = await PermissionEntity.findAll({})

  console.log(JSON.parse(JSON.stringify(roles)), JSON.parse(JSON.stringify(permissions)))

  const rolePermissions = []
  for (const role of roles) {
    for (const permission of permissions) {
      rolePermissions.push({
        can_do_the_action: ['admin', 'developer'].includes(role?.name),
        role_id: role.id,
        permission_id: permission.id
      })
    }
  }

  return RolePermissionEntity.bulkCreate(rolePermissions, { ignoreDuplicates: true })
}
