import { sequelize } from 'src/utils/database'

import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedPermissions } from 'src/utils/seed/permission.seed'
import { seedRolePermissions } from 'src/utils/seed/role-permission.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUsers } from 'src/utils/seed/user.seed'

export const resetTestDatabase = async () => {
  try {
    // Recreate the database schema
    await sequelize.sync({ force: true })

    await seedAuthTemplates()
    await seedRoles()
    await seedPermissions()
    await seedRolePermissions()
    await seedTestUsers()
  } catch (error) {
    console.log('Error while seeding database for testing, error:', error)
  }
}
