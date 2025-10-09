import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const RoleEntity = sequelize.define(
  'role',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    name: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ['admin', 'developer', 'moderator', 'user']
    },
    created_by: {
      allowNull: true,
      type: DataTypes.UUID
    }
  },
  {
    createdAt: 'created_at',
    indexes: [
      { fields: ['id'], unique: true },
      { fields: ['created_at'] },
      { fields: ['created_by'] },
      { fields: ['name'], unique: true },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
