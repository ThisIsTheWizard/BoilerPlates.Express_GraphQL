import { authService } from 'src/modules/services'
import { useTransaction } from 'src/utils/database'

export const authMutation = {
  // Authentication
  register: async (_, { input }) =>
    await useTransaction(async (transaction) => authService.registerUser(input, transaction)),

  verifyEmail: async (_, { input }) =>
    await useTransaction(async (transaction) => authService.verifyUserEmail(input, transaction)),

  resendVerificationEmail: async (_, { email }) => {
    await useTransaction(async (transaction) => authService.resendUserVerificationEmail({ email }, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  login: async (_, { input }) => await useTransaction(async (transaction) => authService.loginUser(input, transaction)),

  refreshToken: async (_, { input }) =>
    await useTransaction(async (transaction) => authService.refreshTokensForUser(input, transaction)),

  logout: async (_, __, { token }) => {
    await useTransaction(async (transaction) => authService.logoutAUser({ token, type: 'access_token' }, transaction))
    return { success: true, message: 'LOGGED_OUT' }
  },

  // Password Management
  changePassword: async (_, { input }, { user }) => {
    await useTransaction(async (transaction) =>
      authService.changePasswordByUser({ ...input, user_id: user.user_id }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  },

  forgotPassword: async (_, { input }) => {
    await useTransaction(async (transaction) => authService.forgotPassword(input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  retryForgotPassword: async (_, { input }) => {
    await useTransaction(async (transaction) => authService.retryForgotPassword(input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  verifyForgotPassword: async (_, { input }) => {
    await useTransaction(async (transaction) => authService.verifyForgotPassword(input, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  verifyForgotPasswordCode: async (_, { email, token }) => {
    const result = await useTransaction(async (transaction) =>
      authService.verifyForgotPasswordCode({ email, token }, transaction)
    )
    return { success: result.success, message: result.message }
  },

  verifyUserPassword: async (_, { password }, { user }) => {
    const result = await useTransaction(async (transaction) =>
      authService.verifyUserPassword({ password, user_id: user.user_id }, transaction)
    )
    return { success: result.success, message: result.message }
  },

  // Email Management
  changeEmail: async (_, { email }, { user }) => {
    await useTransaction(async (transaction) =>
      authService.changeEmailByUser({ new_email: email, user_id: user.user_id }, transaction)
    )
    return { success: true, message: 'SUCCESS' }
  },

  cancelChangeEmail: async (_, { email }) => {
    await useTransaction(async (transaction) => authService.cancelChangeEmailByUser({ email }, transaction))
    return { success: true, message: 'SUCCESS' }
  },

  verifyChangeEmail: async (_, { token }, { user }) =>
    await useTransaction(async (transaction) =>
      authService.verifyChangeEmailByUser({ token, user_id: user.user_id }, transaction)
    ),

  // Admin operations
  setUserEmailByAdmin: async (_, { user_id, new_email }) =>
    await useTransaction(async (transaction) => authService.setUserEmailByAdmin({ user_id, new_email }, transaction)),

  setUserPasswordByAdmin: async (_, { user_id, password }) => {
    await useTransaction(async (transaction) => authService.changePasswordByAdmin({ user_id, password }, transaction))
    return { success: true, message: 'SUCCESS' }
  }
}
