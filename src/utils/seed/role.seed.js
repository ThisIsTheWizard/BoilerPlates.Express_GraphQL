import { RoleEntity } from 'src/modules/entities'

export const seedRoles = async () =>
  RoleEntity.bulkCreate([{ name: 'admin' }, { name: 'developer' }, { name: 'moderator' }, { name: 'user' }], {
    ignoreDuplicates: true
  })
