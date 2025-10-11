import { authService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export default {
  // Authentication
  register: async (parent, args) =>
    await useTransaction(async (transaction) => authService.registerUser(args?.input, transaction)),

  verifyEmail: async (parent, args) =>
    await useTransaction(async (transaction) => authService.verifyUserEmail(args?.input, transaction)),

  resendVerificationEmail: async (parent, args) => {
    await useTransaction(async (transaction) =>
      authService.resendUserVerificationEmail({ email: args?.email }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  },

  login: async (parent, args) =>
    await useTransaction(async (transaction) => authService.loginUser(args?.input, transaction)),

  refreshToken: async (parent, args) =>
    await useTransaction(async (transaction) => authService.refreshTokensForUser(args?.input, transaction)),

  logout: async (parent, args, context) => {
    await useTransaction(async (transaction) =>
      authService.logoutAUser({ token: context?.token, type: 'access_token' }, transaction)
    )
    return { success: true, message: 'LOGGED_OUT' }
  },

  // Password Management
  changePassword: async (parent, args, context) => {
    await useTransaction(async (transaction) =>
      authService.changePasswordByUser(
        {
          new_password: args?.input?.new_password,
          old_password: args?.input?.old_password,
          user_id: context?.user?.id
        },
        transaction
      )
    )
    return { success: true, message: 'SUCCESS' }
  },

  forgotPassword: async (parent, args) => {
    await useTransaction(async (transaction) => authService.forgotPassword(args?.input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  retryForgotPassword: async (parent, args) => {
    await useTransaction(async (transaction) => authService.retryForgotPassword(args?.input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  verifyForgotPassword: async (parent, args) => {
    await useTransaction(async (transaction) => authService.verifyForgotPassword(args?.input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  verifyForgotPasswordCode: async (parent, args) => {
    const result = await useTransaction(async (transaction) => authService.verifyForgotPasswordCode(args, transaction))
    return { success: result.success, message: result.message }
  },

  verifyUserPassword: async (parent, args, context) => {
    const result = await useTransaction(async (transaction) =>
      authService.verifyUserPassword({ password: args?.password, user_id: context?.user?.id }, transaction)
    )
    return { success: result.success, message: result.message }
  },

  // Email Management
  changeEmail: async (parent, args, context) => {
    await useTransaction(async (transaction) =>
      authService.changeEmailByUser({ new_email: args?.email, user_id: context?.user?.id }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  },

  cancelChangeEmail: async (parent, args) => {
    await useTransaction(async (transaction) =>
      authService.cancelChangeEmailByUser({ email: args?.email }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  },

  verifyChangeEmail: async (parent, args, context) =>
    await useTransaction(async (transaction) =>
      authService.verifyChangeEmailByUser({ token: args?.token, user_id: context?.user?.id }, transaction)
    ),

  // Admin operations
  setUserEmailByAdmin: async (parent, args) =>
    await useTransaction(async (transaction) => authService.setUserEmailByAdmin(args, transaction)),

  setUserPasswordByAdmin: async (parent, args) => {
    await useTransaction(async (transaction) => authService.changePasswordByAdmin(args, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
