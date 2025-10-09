import { AuthTemplateEntity } from 'src/modules/auth-template/auth-template.entity'
import { AuthTokenEntity } from 'src/modules/auth-token/auth-token.entity'
import { PermissionEntity } from 'src/modules/permission/permission.entity'
import { RolePermissionEntity } from 'src/modules/role-permission/role-permission.entity'
import { RoleUserEntity } from 'src/modules/role-user/role-user.entity'
import { RoleEntity } from 'src/modules/role/role.entity'
import { UserEntity } from 'src/modules/user/user.entity'
import { VerificationTokenEntity } from 'src/modules/verification-token/verification-token.entity'

// ==== Associations ====
// <--- RoleEntity --->
RoleEntity.belongsToMany(PermissionEntity, {
  as: 'permissions',
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  through: 'role_permissions'
})
PermissionEntity.belongsToMany(RoleEntity, {
  as: 'roles',
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  through: 'role_permissions'
})

// <--- RolePermissionEntity --->
RolePermissionEntity.belongsTo(PermissionEntity, { foreignKey: 'permission_id', onDelete: 'CASCADE' })
RolePermissionEntity.belongsTo(RoleEntity, { foreignKey: 'role_id', onDelete: 'CASCADE' })

// <--- UserEntity --->
UserEntity.hasMany(AuthTokenEntity, { foreignKey: 'user_id' })
AuthTokenEntity.belongsTo(UserEntity, { foreignKey: 'user_id' })

UserEntity.hasMany(PermissionEntity, { foreignKey: 'created_by' })
PermissionEntity.belongsTo(UserEntity, { as: 'author', foreignKey: 'created_by' })

UserEntity.hasMany(RoleEntity, { as: 'owned_roles', foreignKey: 'created_by' })
RoleEntity.belongsTo(UserEntity, { as: 'author', foreignKey: 'created_by' })

UserEntity.belongsToMany(RoleEntity, {
  as: 'roles',
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
  otherKey: 'role_id',
  through: 'role_users'
})
RoleEntity.belongsToMany(UserEntity, {
  as: 'users',
  foreignKey: 'role_id',
  onDelete: 'CASCADE',
  otherKey: 'user_id',
  through: 'role_users'
})

UserEntity.hasMany(RolePermissionEntity, { foreignKey: 'created_by' })
RolePermissionEntity.belongsTo(UserEntity, { as: 'author', foreignKey: 'created_by' })

UserEntity.hasMany(RoleUserEntity, { foreignKey: 'user_id', onDelete: 'CASCADE' })
RoleUserEntity.belongsTo(UserEntity, { foreignKey: 'user_id' })
RoleEntity.hasMany(RoleUserEntity, { foreignKey: 'role_id', onDelete: 'CASCADE' })
RoleUserEntity.belongsTo(RoleEntity, { foreignKey: 'role_id' })

UserEntity.hasMany(VerificationTokenEntity, { foreignKey: 'user_id' })
VerificationTokenEntity.belongsTo(UserEntity, { foreignKey: 'user_id' })

// Have to sync parent entity first because of foreign key constraints
export const syncEntitiesIntoDatabase = async () => {
  await AuthTemplateEntity.sync({ alter: true })
  await UserEntity.sync({ alter: true })
  await AuthTokenEntity.sync({ alter: true })
  await VerificationTokenEntity.sync({ alter: true })
  await RoleEntity.sync({ alter: true })
  await RoleUserEntity.sync({ alter: true })
  await PermissionEntity.sync({ alter: true })
  await RolePermissionEntity.sync({ alter: true })
}

// Sync entities into database
// syncEntitiesIntoDatabase()
//   .then(() => console.log('Successfully synced database entities'))
//   .catch((err) => console.error('Could not sync database entities properly, error:', err))

// Export all entities
export {
  AuthTemplateEntity,
  AuthTokenEntity,
  PermissionEntity,
  RoleEntity,
  RolePermissionEntity,
  RoleUserEntity,
  UserEntity,
  VerificationTokenEntity
}
