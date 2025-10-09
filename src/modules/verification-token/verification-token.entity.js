import moment from 'moment-timezone'
import { DataTypes } from 'sequelize'

// Utils
import { sequelize } from 'src/utils/database'

export const VerificationTokenEntity = sequelize.define(
  'verification_token',
  {
    id: {
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      type: DataTypes.UUID
    },
    email: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    expired_at: {
      allowNull: false,
      defaultValue: () => moment().add(5, 'minutes').toDate(),
      type: DataTypes.DATE
    },
    status: {
      allowNull: false,
      defaultValue: 'unverified',
      type: DataTypes.ENUM,
      values: ['cancelled', 'verified', 'unverified']
    },
    token: {
      allowNull: false,
      type: DataTypes.STRING
    },
    type: {
      allowNull: false,
      defaultValue: 'user_verification',
      type: DataTypes.ENUM,
      values: ['forgot_password', 'user_verification']
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
      { fields: ['email', 'token', 'user_id'] },
      { fields: ['created_at'] },
      { fields: ['updated_at'] }
    ],
    timestamps: true,
    updatedAt: 'updated_at'
  }
)
