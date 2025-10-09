import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const UserEntity = sequelize.define(
  'user',
  {
    id: {
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING
    },
    first_name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    last_name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    new_email: {
      allowNull: true,
      type: DataTypes.STRING
    },
    phone_number: {
      allowNull: true,
      type: DataTypes.STRING
    },
    old_passwords: {
      allowNull: false,
      defaultValue: [],
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING
    },
    status: {
      allowNull: false,
      defaultValue: 'unverified',
      type: DataTypes.ENUM,
      values: ['active', 'inactive', 'invited', 'unverified']
    }
  },
  {
    createdAt: 'created_at',
    indexes: [
      { fields: ['id'], unique: true },
      { fields: ['created_at'] },
      { fields: ['email'], unique: true },
      { fields: ['first_name', 'last_name'] },
      { fields: ['status'] },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
