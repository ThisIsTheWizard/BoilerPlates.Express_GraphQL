// Entities
import { AuthTemplateEntity, RoleEntity, syncEntitiesIntoDatabase, UserEntity } from 'src/modules/entities'

// Seeders
import { seedAuthTemplates } from 'src/utils/seed/auth-template.seed'
import { seedRoles } from 'src/utils/seed/role.seed'
import { seedTestUsers } from 'src/utils/seed/user.seed'

// Helpers
import { verificationTokenHelper } from 'src/modules/helpers'

export const startDBSetupForTesting = async (req, res, next) => {
  try {
    if (!(process.env.NODE_ENV === 'test')) {
      return res.status(403).json({ message: 'FORBIDDEN' })
    }

    await syncEntitiesIntoDatabase()

    // Clearing existing data
    await AuthTemplateEntity.sync({ force: true })
    await RoleEntity.sync({ force: true })
    await UserEntity.sync({ force: true })

    await seedAuthTemplates()
    const roles = await seedRoles()
    await seedTestUsers(roles)

    res.status(200).json({ message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

export const getLatestVerificationTokenForTesting = async (req, res, next) => {
  try {
    if (!(process.env.NODE_ENV === 'test')) {
      return res.status(403).json({ message: 'FORBIDDEN' })
    }

    const { email, status = 'unverified', type, user_id: userId } = req.query || {}

    const where = { status }
    if (email) where.email = email
    if (type) where.type = type
    if (userId) where.user_id = userId

    const token = await verificationTokenHelper.getAVerificationToken({ order: [['created_at', 'DESC']], where }, null)

    if (!token?.id) {
      return res.status(404).json({ message: 'VERIFICATION_TOKEN_NOT_FOUND' })
    }

    const data = token.toJSON?.() || token
    return res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

export { seedAuthTemplates, seedRoles }
