import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const RoleUserEntity = sequelize.define(
  'role_user',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    role_id: {
      allowNull: false,
      type: DataTypes.UUID
    },
    user_id: {
      allowNull: false,
      type: DataTypes.UUID
    }
  },
  {
    createdAt: 'created_at',
    indexes: [
      { fields: ['id'], unique: true },
      { fields: ['created_at'] },
      { fields: ['role_id', 'user_id'], unique: true },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
