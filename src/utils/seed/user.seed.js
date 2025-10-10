// Entities
import { RoleEntity, RoleUserEntity, UserEntity } from 'src/modules/entities'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async () => {
  const hashedPassword = commonService.generateHashPassword('123456aA@')
  const users = await UserEntity.bulkCreate(
    [
      {
        email: 'admin@test.com',
        first_name: 'Test',
        last_name: 'User 1',
        password: hashedPassword,
        status: 'active'
      },
      {
        email: 'test-1@test.com',
        first_name: 'Test',
        last_name: 'User 1',
        password: hashedPassword,
        status: 'active'
      },
      {
        email: 'test-2@test.com',
        first_name: 'Test',
        last_name: 'User 2',
        password: hashedPassword,
        status: 'active'
      }
    ],
    { ignoreDuplicates: true }
  )

  const roles = await RoleEntity.findAll({})
  const role_users = []
  for (const user of users) {
    for (const role of roles) {
      role_users.push({ role_id: role?.id, user_id: user?.id })
    }
  }

  await RoleUserEntity.bulkCreate(role_users, { ignoreDuplicates: true })

  return users
}
