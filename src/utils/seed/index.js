import { syncEntitiesIntoDatabase } from 'src/modules/entities'

import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedPermissions } from 'src/utils/seed/permission.seed'
import { seedRolePermissions } from 'src/utils/seed/role-permission.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUsers } from 'src/utils/seed/user.seed'

export const seedDatabase = async (is_reset = false) => {
  try {
    // Sync tables into database
    await syncEntitiesIntoDatabase(is_reset)

    await seedAuthTemplates()
    await seedRoles()
    await seedPermissions()
    await seedRolePermissions()
    await seedTestUsers()
  } catch (error) {
    console.log('Error while seeding database for testing, error:', error)
  }
}
