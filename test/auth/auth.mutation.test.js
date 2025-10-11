import { VerificationTokenEntity } from 'src/modules/entities'
import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`

const waitForVerificationToken = async ({ email, status = 'unverified', type }) => {
  let token
  const where = { email, status }
  if (type) where.type = type

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const verificationToken = await VerificationTokenEntity.findOne({
        order: [['created_at', 'DESC']],
        where
      })
      token = verificationToken?.token || null
      if (token) break
    } catch (error) {
      if (error?.response?.status !== 404) throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  if (!token) throw new Error('VERIFICATION_TOKEN_NOT_FOUND')
  return token
}

describe('Auth Mutation Tests', () => {
  const context = {}

  describe('register mutation', () => {
    it('registers a user successfully', async () => {
      const email = randomEmail('register')
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            email
            first_name
            last_name
            status
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email,
            first_name: 'Test',
            last_name: 'User',
            password: 'Test123!@#'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.register.email).to.equal(email)
      context.registerUser = { email, password: 'Test123!@#' }
    })

    it('returns error when email already exists', async () => {
      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            id
            email
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: context.registerUser.email,
            first_name: 'Duplicate',
            last_name: 'User',
            password: 'Test123!@#'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    })
  })

  describe('login mutation', () => {
    it('logs in successfully with valid credentials', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: 'admin@test.com',
            password: '123456aA@'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.login).to.have.keys(['access_token', 'refresh_token'])
    })

    it('returns error for invalid credentials', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: 'admin@test.com',
            password: 'wrongpassword'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PASSWORD_IS_INCORRECT')
    })
  })

  describe('verifyEmail mutation', () => {
    it('verifies user email successfully', async () => {
      const token = await waitForVerificationToken({
        email: context.registerUser.email,
        type: 'user_verification'
      })
      const mutation = `
        mutation VerifyEmail($input: VerifyEmailInput!) {
          verifyEmail(input: $input) {
            id
            status
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: context.registerUser.email,
            token
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.verifyEmail.status).to.equal('active')
    })

    it('returns error for invalid token', async () => {
      const mutation = `
        mutation VerifyEmail($input: VerifyEmailInput!) {
          verifyEmail(input: $input) {
            id
            status
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            email: context.registerUser.email,
            token: 'invalid'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('OTP_IS_NOT_VALID')
    })
  })

  describe('refreshToken mutation', () => {
    it('refreshes tokens successfully', async () => {
      const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
      const mutation = `
        mutation RefreshToken($input: RefreshTokenInput!) {
          refreshToken(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: tokens }
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.refreshToken.access_token).to.be.a('string')
    })

    it('returns error when tokens are missing', async () => {
      const mutation = `
        mutation RefreshToken($input: RefreshTokenInput!) {
          refreshToken(input: $input) {
            access_token
            refresh_token
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: {} }
      })

      expect(response.status).to.equal(400)
      expect(response.data.errors).to.exist
    })
  })

  describe('logout mutation', () => {
    it('logs out successfully', async () => {
      const tokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
      const mutation = `
        mutation Logout {
          logout {
            success
            message
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation
        },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.logout.success).to.equal(true)
    })

    it('returns error when token is missing', async () => {
      const mutation = `
        mutation Logout {
          logout {
            success
          }
        }
      `
      const response = await api.post('/graphql', { query: mutation })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('changePassword mutation', () => {
    it('changes password successfully', async () => {
      const tokens = await loginAndGetTokens({
        email: context.registerUser.email,
        password: context.registerUser.password
      })
      const mutation = `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input) {
            success
            message
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              old_password: context.registerUser.password,
              new_password: 'NewPass123!@#'
            }
          }
        },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.changePassword.success).to.equal(true)
      context.registerUser.password = 'NewPass123!@#'
    })

    it('returns error for wrong old password', async () => {
      const tokens = await loginAndGetTokens({
        email: context.registerUser.email,
        password: context.registerUser.password
      })
      const mutation = `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input) {
            success
          }
        }
      `
      const response = await api.post(
        '/graphql',
        {
          query: mutation,
          variables: {
            input: {
              old_password: 'wrongpassword',
              new_password: 'NewPass456!@#'
            }
          }
        },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('PASSWORD_IS_INCORRECT')
    })

    it('returns error when not authenticated', async () => {
      const mutation = `
        mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input) {
            success
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: {
          input: {
            old_password: 'test',
            new_password: 'NewPass456!@#'
          }
        }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })

  describe('forgotPassword mutation', () => {
    it('triggers forgot password successfully', async () => {
      const mutation = `
        mutation ForgotPassword($input: ForgotPasswordInput!) {
          forgotPassword(input: $input) {
            success
            message
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { email: context.registerUser.email } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.forgotPassword.success).to.equal(true)
    })

    it('returns error for non-existent user', async () => {
      const mutation = `
        mutation ForgotPassword($input: ForgotPasswordInput!) {
          forgotPassword(input: $input) {
            success
          }
        }
      `
      const response = await api.post('/graphql', {
        query: mutation,
        variables: { input: { email: 'nonexistent@test.com' } }
      })

      expect(response.status).to.equal(200)
      expect(response.data.errors).to.exist
      expect(response.data.errors[0].message).to.equal('USER_DOES_NOT_EXIST')
    })
  })

  describe('Forgot password additional flows', () => {
    const ctx = {}

    before(async () => {
      const email = randomEmail('auth-forgot')
      const mutation = `
        mutation Register($input: RegisterInput!) { register(input: $input) { id email } }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: { input: { email, first_name: 'Auth', last_name: 'Forgot', password: 'Forgot123!@#' } }
      })
      ctx.user = res.data.data.register
    })

    it('retryForgotPassword succeeds after forgotPassword', async () => {
      const forgot = `
        mutation Forgot($input: ForgotPasswordInput!) { forgotPassword(input: $input) { success message } }
      `
      const retry = `
        mutation Retry($input: ForgotPasswordInput!) { retryForgotPassword(input: $input) { success message } }
      `
      const f = await api.post('/graphql', { query: forgot, variables: { input: { email: ctx.user.email } } })
      expect(f.status).to.equal(200)
      expect(f.data.data.forgotPassword.success).to.equal(true)

      const r = await api.post('/graphql', { query: retry, variables: { input: { email: ctx.user.email } } })
      expect(r.status).to.equal(200)
      expect(r.data.data.retryForgotPassword.success).to.equal(true)
    })

    it('verifyForgotPasswordCode validates the OTP', async () => {
      const forgot = `
        mutation Forgot($input: ForgotPasswordInput!) { forgotPassword(input: $input) { success message } }
      `
      await api.post('/graphql', { query: forgot, variables: { input: { email: ctx.user.email } } })

      const token = await waitForVerificationToken({ email: ctx.user.email, type: 'forgot_password' })
      const verifyCode = `
        mutation VerifyCode($email: String!, $token: String!) { verifyForgotPasswordCode(email: $email, token: $token) { success message } }
      `
      const res = await api.post('/graphql', { query: verifyCode, variables: { email: ctx.user.email, token } })
      expect(res.status).to.equal(200)
      expect(res.data.data.verifyForgotPasswordCode.success).to.equal(true)
      expect(res.data.data.verifyForgotPasswordCode.message).to.equal('OTP_IS_VALID')
    })

    it('verifyForgotPassword resets the password', async () => {
      const forgot = `
        mutation Forgot($input: ForgotPasswordInput!) { forgotPassword(input: $input) { success message } }
      `
      await api.post('/graphql', { query: forgot, variables: { input: { email: ctx.user.email } } })

      const token = await waitForVerificationToken({ email: ctx.user.email, type: 'forgot_password' })
      const newPassword = 'NewForgot123!@#'
      const reset = `
        mutation VerifyForgot($input: ResetPasswordInput!) { verifyForgotPassword(input: $input) { success message } }
      `
      const res = await api.post('/graphql', {
        query: reset,
        variables: { input: { email: ctx.user.email, password: newPassword, token } }
      })
      expect(res.status).to.equal(200)
      expect(res.data.data.verifyForgotPassword.success).to.equal(true)
    })
  })

  describe('verifyUserPassword mutation', () => {
    const ctx = {}

    before(async () => {
      const email = randomEmail('auth-vup')
      const mutation = `
        mutation Register($input: RegisterInput!) { register(input: $input) { id email } }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: { input: { email, first_name: 'Auth', last_name: 'VerifyPwd', password: 'VerifyPwd123!@#' } }
      })
      ctx.user = res.data.data.register

      // Verify email before login
      const token = await waitForVerificationToken({ email, type: 'user_verification' })
      const verifyEmailMutation = `
        mutation VerifyEmail($input: VerifyEmailInput!) { verifyEmail(input: $input) { id status } }
      `
      await api.post('/graphql', { query: verifyEmailMutation, variables: { input: { email, token } } })

      ctx.tokens = await loginAndGetTokens({ email, password: 'VerifyPwd123!@#' })
    })

    it('returns success for correct password', async () => {
      const mutation = `
        mutation VerifyUserPassword($password: String!) { verifyUserPassword(password: $password) { success message } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { password: 'VerifyPwd123!@#' } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.verifyUserPassword.success).to.equal(true)
      expect(res.data.data.verifyUserPassword.message).to.equal('PASSWORD_IS_CORRECT')
    })

    it('returns false for incorrect password', async () => {
      const mutation = `
        mutation VerifyUserPassword($password: String!) { verifyUserPassword(password: $password) { success message } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { password: 'WrongPassword!@#' } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.verifyUserPassword.success).to.equal(false)
      expect(res.data.data.verifyUserPassword.message).to.equal('PASSWORD_IS_INCORRECT')
    })
  })

  describe('Email change flows', () => {
    const ctx = {}

    before(async () => {
      const email = randomEmail('auth-email')
      const mutation = `
        mutation Register($input: RegisterInput!) { register(input: $input) { id email } }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: { input: { email, first_name: 'Auth', last_name: 'Email', password: 'AuthEmail123!@#' } }
      })
      ctx.user = res.data.data.register

      // Verify email
      const verifyToken = await waitForVerificationToken({ email, type: 'user_verification' })
      const verifyEmailMutation = `
        mutation VerifyEmail($input: VerifyEmailInput!) { verifyEmail(input: $input) { id status } }
      `
      await api.post('/graphql', { query: verifyEmailMutation, variables: { input: { email, token: verifyToken } } })

      ctx.tokens = await loginAndGetTokens({ email, password: 'AuthEmail123!@#' })
    })

    it('changeEmail generates a verification token', async () => {
      const newEmail = randomEmail('new-email')
      ctx.newEmail = newEmail
      const mutation = `
        mutation ChangeEmail($email: String!) { changeEmail(email: $email) { success message } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { email: newEmail } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.changeEmail.success).to.equal(true)
    })

    it('verifyChangeEmail updates the user email', async () => {
      const token = await waitForVerificationToken({ email: ctx.newEmail, type: 'user_verification' })
      const mutation = `
        mutation VerifyChangeEmail($token: String!) { verifyChangeEmail(token: $token) { id email } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { token } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.verifyChangeEmail.email).to.equal(ctx.newEmail)
    })

    it('cancelChangeEmail cancels a pending change', async () => {
      const nextEmail = randomEmail('cancel-email')
      const changeMutation = `
        mutation ChangeEmail($email: String!) { changeEmail(email: $email) { success message } }
      `
      await api.post(
        '/graphql',
        { query: changeMutation, variables: { email: nextEmail } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      const cancelMutation = `
        mutation CancelChangeEmail($email: String!) { cancelChangeEmail(email: $email) { success message } }
      `
      const res = await api.post(
        '/graphql',
        { query: cancelMutation, variables: { email: nextEmail } },
        { headers: { Authorization: ctx.tokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.cancelChangeEmail.success).to.equal(true)
    })

    it('resendVerificationEmail succeeds for an unverified user', async () => {
      const email = randomEmail('resend')
      const register = `
        mutation Register($input: RegisterInput!) { register(input: $input) { id email } }
      `
      await api.post('/graphql', {
        query: register,
        variables: { input: { email, first_name: 'Re', last_name: 'Send', password: 'Resend123!@#' } }
      })

      const resend = `
        mutation Resend($email: String!) { resendVerificationEmail(email: $email) { success message } }
      `
      const res = await api.post('/graphql', { query: resend, variables: { email } })
      expect(res.status).to.equal(200)
      expect(res.data.data.resendVerificationEmail.success).to.equal(true)
    })
  })

  describe('Admin operations', () => {
    const ctx = {}

    before(async () => {
      ctx.adminTokens = await loginAndGetTokens({ email: 'admin@test.com', password: '123456aA@' })
      const email = randomEmail('admin-target')
      const register = `
        mutation Register($input: RegisterInput!) { register(input: $input) { id email } }
      `
      const regRes = await api.post('/graphql', {
        query: register,
        variables: { input: { email, first_name: 'Admin', last_name: 'Target', password: 'AdminTarget123!@#' } }
      })
      ctx.targetUser = regRes.data.data.register
    })

    it('setUserEmailByAdmin updates user email', async () => {
      const newEmail = randomEmail('admin-new')
      const mutation = `
        mutation SetEmail($user_id: ID!, $new_email: String!) { setUserEmailByAdmin(user_id: $user_id, new_email: $new_email) { id email } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { user_id: ctx.targetUser.id, new_email: newEmail } },
        { headers: { Authorization: ctx.adminTokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.setUserEmailByAdmin.email).to.equal(newEmail)
    })

    it('setUserPasswordByAdmin resets password', async () => {
      const mutation = `
        mutation SetPassword($user_id: ID!, $password: String!) { setUserPasswordByAdmin(user_id: $user_id, password: $password) { success message } }
      `
      const res = await api.post(
        '/graphql',
        { query: mutation, variables: { user_id: ctx.targetUser.id, password: 'AdminReset123!@#' } },
        { headers: { Authorization: ctx.adminTokens.access_token } }
      )

      expect(res.status).to.equal(200)
      expect(res.data.data.setUserPasswordByAdmin.success).to.equal(true)
    })

    it('returns unauthorized without admin token', async () => {
      const mutation = `
        mutation SetPassword($user_id: ID!, $password: String!) { setUserPasswordByAdmin(user_id: $user_id, password: $password) { success } }
      `
      const res = await api.post('/graphql', {
        query: mutation,
        variables: { user_id: ctx.targetUser.id, password: 'NoAuth123!@#' }
      })
      expect(res.status).to.equal(200)
      expect(res.data.errors).to.exist
      expect(res.data.errors[0].message).to.equal('UNAUTHORIZED')
    })
  })
})
