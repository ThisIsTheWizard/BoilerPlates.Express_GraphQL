import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const AuthTokenEntity = sequelize.define(
  'auth_token',
  {
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    access_token: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    expires_at: {
      allowNull: true,
      type: DataTypes.DATE
    },
    refresh_token: {
      allowNull: true,
      type: DataTypes.TEXT
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
      { fields: ['access_token', 'user_id'], unique: true },
      { fields: ['created_at'] },
      { fields: ['refresh_token'] },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
