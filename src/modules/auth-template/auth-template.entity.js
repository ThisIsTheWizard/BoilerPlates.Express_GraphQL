import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const AuthTemplateEntity = sequelize.define(
  'auth_template',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    body: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    created_by: {
      allowNull: true,
      type: DataTypes.UUID
    },
    event: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    subject: {
      allowNull: false,
      type: DataTypes.TEXT
    }
  },
  {
    createdAt: 'created_at',
    indexes: [
      { fields: ['id'], unique: true },
      { fields: ['created_at'] },
      { fields: ['created_by'] },
      { fields: ['event'], unique: true },
      { fields: ['subject'] },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
