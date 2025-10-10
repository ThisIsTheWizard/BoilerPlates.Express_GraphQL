import { PermissionEntity } from 'src/modules/entities'

export const seedPermissions = async () => {
  const permissions = []
  for (const module of ['permission', 'role', 'role_permission', 'role_user', 'user']) {
    for (const action of ['create', 'read', 'update', 'delete']) {
      permissions.push({ action, module })
    }
  }

  return PermissionEntity.bulkCreate(permissions, { ignoreDuplicates: true })
}
