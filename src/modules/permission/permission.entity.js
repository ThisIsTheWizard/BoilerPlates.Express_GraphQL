import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const PermissionEntity = sequelize.define(
  'permission',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    action: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ['create', 'read', 'update', 'delete']
    },
    module: {
      allowNull: false,
      type: DataTypes.ENUM,
      values: ['permission', 'role', 'role_permission', 'role_user', 'user']
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
      { fields: ['action'], unique: true },
      { fields: ['module'] },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
