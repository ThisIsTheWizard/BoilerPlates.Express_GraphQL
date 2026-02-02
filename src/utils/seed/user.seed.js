// Entities
import { RoleEntity, RoleUserEntity, UserEntity } from 'src/modules/entities'

// Services
import { commonService } from 'src/modules/services'

export const seedTestUsers = async () => {
  const hashedPassword = commonService.generateHashPassword('123456aA@')
  const users = await UserEntity.bulkCreate(
    [
      {
        email: 'admin@wizardcld.com',
        first_name: 'Admin',
        last_name: 'Test',
        password: hashedPassword,
        status: 'active'
      },
      {
        email: 'developer@test.com',
        first_name: 'Developer',
        last_name: 'Test',
        password: hashedPassword,
        status: 'active'
      },
      {
        email: 'moderator@test.com',
        first_name: 'Moderator',
        last_name: 'Test',
        password: hashedPassword,
        status: 'active'
      },
      {
        email: 'user@test.com',
        first_name: 'Test',
        last_name: 'User',
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
      if (
        (user.email === 'admin@wizardcld.com' && role.name === 'admin') ||
        (user.email === 'developer@test.com' && role.name === 'developer') ||
        (user.email === 'moderator@test.com' && role.name === 'moderator') ||
        (user.email === 'user@test.com' && role.name === 'user')
      ) {
        role_users.push({ role_id: role?.id, user_id: user?.id })
      }
    }
  }

  await RoleUserEntity.bulkCreate(role_users, { ignoreDuplicates: true })

  return users
}
