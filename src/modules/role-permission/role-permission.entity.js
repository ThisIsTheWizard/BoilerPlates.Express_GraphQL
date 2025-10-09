import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const RolePermissionEntity = sequelize.define(
  'role_permission',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    role_id: {
      allowNull: false,
      onDelete: 'CASCADE',
      type: DataTypes.UUID
    },
    permission_id: {
      allowNull: false,
      onDelete: 'CASCADE',
      type: DataTypes.UUID
    },
    can_do_the_action: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    created_by: {
      allowNull: true,
      type: DataTypes.UUID
    },
    updated_by: {
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
      { fields: ['permission_id', 'role_id'], unique: true },
      { fields: ['updated_at'] },
      { fields: ['updated_by'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
