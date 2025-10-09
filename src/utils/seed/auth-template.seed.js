import { AuthTemplateEntity } from 'src/modules/entities'

export const seedAuthTemplates = async () =>
  AuthTemplateEntity.bulkCreate(
    [
      {
        event: 'send_user_verification_token',
        body: '<h1>Welcome, {{username}}!</h1><p>Thank you for registering with us. Please verify your email with this OTP: <strong>{{token}}</strong>.</p><p>Best regards,<br/>The Team</p>',
        subject: 'Welcome to Our Service, {{username}}!'
      },
      {
        event: 'send_forgot_password_token',
        body: '<h1>Hello, {{username}}!</h1><p>We are feeling sorry to know that you forgot your password. Please verify your email with this OTP: <strong>{{token}}</strong> to reset the password</p><p>If you did not request this, please ignore this email.</p><p>Best regards,<br/>The Team</p>',
        subject: 'Password Reset Request'
      }
    ],
    { ignoreDuplicates: true }
  )
