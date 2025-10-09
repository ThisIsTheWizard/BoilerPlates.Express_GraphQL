// Entities
import { RoleUserEntity, UserEntity } from 'src/modules/entities'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async (roles) => {
  const users = await UserEntity.bulkCreate(
    [
      {
        email: 'test@user.com',
        first_name: 'Test',
        last_name: 'User',
        password: commonService.generateHashPassword('123456aA@'),
        roles: [{ name: 'admin' }, { name: 'user' }],
        status: 'active'
      }
    ],
    { ignoreDuplicates: true }
  )

  const role_users = []
  for (const user of users) {
    for (const role of roles) {
      role_users.push({ role_id: role?.id, user_id: user?.id })
    }
  }

  await RoleUserEntity.bulkCreate(role_users, { ignoreDuplicates: true })

  return users
}
