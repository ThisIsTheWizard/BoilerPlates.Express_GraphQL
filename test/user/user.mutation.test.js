import { api, expect, loginAndGetTokens } from 'test/setup'

const randomEmail = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const waitForVerificationToken = async ({ email, status = 'unverified', type }) => {
  const params = { email, status }
  if (type) params.type = type

  let token
  let lastError

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await api.get('/test/verification-tokens', { params })
      token = response.data.data
      if (token) break
    } catch (error) {
      lastError = error
      if (error?.response?.status !== 404) {
        throw error
      }
    }

    await wait(250)
  }

  if (!token) {
    const message = lastError?.response?.data?.message || 'VERIFICATION_TOKEN_NOT_FOUND'
    throw new Error(message)
  }

  return token
}

const registerTestUser = async ({ prefix, password, verify = false }) => {
  const email = randomEmail(prefix)
  const registerResponse = await api.post('/users/register', {
    email,
    first_name: `${prefix}-first`,
    last_name: `${prefix}-last`,
    password
  })

  const registrationData = registerResponse.data.data
  const verificationToken = await waitForVerificationToken({ email, type: 'user_verification' })

  if (verify) {
    await api.post('/users/verify-user-email', { email, token: verificationToken.token })
  }

  return {
    email,
    id: registrationData?.id || verificationToken?.user_id,
    password,
    verificationToken: verificationToken.token
  }
}

describe('User Mutation Tests', () => {
  const context = {}

  before(async () => {
    context.register = await registerTestUser({ prefix: 'register', password: 'Register123!@#', verify: false })
    context.resend = await registerTestUser({ prefix: 'resend', password: 'Resend123!@#', verify: false })
    context.changeEmail = await registerTestUser({ prefix: 'change', password: 'Change123!@#', verify: true })
    context.adminManaged = await registerTestUser({ prefix: 'admin', password: 'Admin123!@#', verify: true })
    context.password = await registerTestUser({ prefix: 'password', password: 'Password123!@#', verify: true })
    context.forgot = await registerTestUser({ prefix: 'forgot', password: 'Forgot123!@#', verify: true })
  })

  describe('POST /users/register', () => {
    it('registers a user successfully', async () => {
      const email = randomEmail('new-register')
      const response = await api.post('/users/register', {
        email,
        first_name: 'Register',
        last_name: 'User',
        password: 'Register123!@#'
      })

      expect(response.status).to.equal(201)
      expect(response.data.data.email).to.equal(email)
    })

    it('returns error when email already exists', async () => {
      let error

      try {
        await api.post('/users/register', {
          email: context.register.email,
          first_name: 'Duplicate',
          last_name: 'User',
          password: 'Register123!@#'
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    })
  })

  describe('POST /users/verify-user-email', () => {
    it('verifies user email successfully', async () => {
      const token = await waitForVerificationToken({ email: context.register.email, type: 'user_verification' })
      const response = await api.post('/users/verify-user-email', {
        email: context.register.email,
        token: token.token
      })

      expect(response.status).to.equal(200)
      expect(response.data.data.status).to.equal('active')
    })

    it('returns error for invalid verification token', async () => {
      let error

      try {
        await api.post('/users/verify-user-email', {
          email: context.register.email,
          token: '000000'
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('OTP_IS_NOT_VALID')
    })
  })

  describe('POST /users/resend-verification-email', () => {
    it('resends verification email successfully', async () => {
      const response = await api.post('/users/resend-verification-email', { email: context.resend.email })

      expect(response.status).to.equal(200)
      expect(response.data.message).to.equal('SUCCESS')
    })

    it('returns error when user is already verified', async () => {
      let error

      try {
        await api.post('/users/resend-verification-email', { email: context.changeEmail.email })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('USER_IS_ALREADY_VERIFIED')
    })
  })

  describe('POST /users/login', () => {
    it('logs in successfully with valid credentials', async () => {
      const response = await api.post('/users/login', {
        email: 'test@user.com',
        password: '123456aA@'
      })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.have.keys(['access_token', 'refresh_token'])
    })

    it('returns error for invalid credentials', async () => {
      let error

      try {
        await api.post('/users/login', {
          email: 'test@user.com',
          password: 'invalidPassword!1'
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('PASSWORD_IS_INCORRECT')
    })
  })

  describe('POST /users/refresh-token', () => {
    it('refreshes tokens successfully', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      const response = await api.post('/users/refresh-token', tokens)

      expect(response.status).to.equal(200)
      expect(response.data.data.access_token).to.be.a('string')
      expect(response.data.data.refresh_token).to.be.a('string')
    })

    it('returns error when tokens are missing', async () => {
      let error

      try {
        await api.post('/users/refresh-token', {})
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_ACCESS_TOKEN_AND_REFRESH_TOKEN')
    })
  })

  describe('POST /users/logout', () => {
    it('logs out successfully with valid token', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      const response = await api.post('/users/logout', {}, { headers: { Authorization: tokens.access_token } })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.deep.equal({ message: 'LOGGED_OUT', success: true })
    })

    it('returns 401 when authorization header is missing', async () => {
      let error

      try {
        await api.post('/users/logout')
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(401)
      expect(error?.response?.data?.message).to.equal('MISSING_TOKEN')
    })
  })

  describe('POST /users/change-email', () => {
    let changeEmailHeaders

    before(async () => {
      const tokens = await loginAndGetTokens({
        email: context.changeEmail.email,
        password: context.changeEmail.password
      })
      changeEmailHeaders = { headers: { Authorization: tokens.access_token } }
    })

    it('initiates email change successfully', async () => {
      const newEmail = randomEmail('updated-email')
      const response = await api.post('/users/change-email', { email: newEmail }, changeEmailHeaders)

      expect(response.status).to.equal(200)
      context.changeEmail.newEmail = newEmail
      context.changeEmail.verificationToken = (
        await waitForVerificationToken({ email: newEmail, type: 'user_verification' })
      ).token
      context.changeEmail.headers = changeEmailHeaders
    })

    it('returns error for invalid email', async () => {
      let error

      try {
        await api.post('/users/change-email', { email: 'invalid-email' }, changeEmailHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('EMAIL_IS_INVALID')
    })
  })

  describe('POST /users/verify-change-email', () => {
    it('verifies changed email successfully', async () => {
      const response = await api.post(
        '/users/verify-change-email',
        { token: context.changeEmail.verificationToken },
        context.changeEmail.headers
      )

      expect(response.status).to.equal(200)
      context.changeEmail.email = context.changeEmail.newEmail
    })

    it('returns error for invalid verification token', async () => {
      let error

      try {
        await api.post('/users/verify-change-email', { token: 'invalid-token' }, context.changeEmail.headers)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('OTP_IS_NOT_VALID')
    })
  })

  describe('POST /users/cancel-change-email', () => {
    let cancelHeaders
    let cancelEmail

    before(async () => {
      const tokens = await loginAndGetTokens({
        email: context.changeEmail.email,
        password: context.changeEmail.password
      })
      cancelHeaders = { headers: { Authorization: tokens.access_token } }
      cancelEmail = randomEmail('cancel-email')
      await api.post('/users/change-email', { email: cancelEmail }, cancelHeaders)
    })

    it('cancels email change successfully', async () => {
      const response = await api.post('/users/cancel-change-email', { email: cancelEmail }, cancelHeaders)

      expect(response.status).to.equal(200)
    })

    it('returns error when email is missing', async () => {
      let error

      try {
        await api.post('/users/cancel-change-email', {}, cancelHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_EMAIL')
    })
  })

  describe('POST /users/set-user-email', () => {
    let adminHeaders

    before(async () => {
      const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
      adminHeaders = { headers: { Authorization: tokens.access_token } }
    })

    it('updates user email by admin successfully', async () => {
      const newEmail = randomEmail('admin-email')
      const response = await api.post(
        '/users/set-user-email',
        { new_email: newEmail, user_id: context.adminManaged.id },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      expect(response.data.data.email).to.equal(newEmail)
      context.adminManaged.email = newEmail
    })

    it('returns error when new email already exists', async () => {
      let error

      try {
        await api.post(
          '/users/set-user-email',
          { new_email: context.register.email, user_id: context.adminManaged.id },
          adminHeaders
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('NEW_EMAIL_IS_ALREADY_ASSOCIATED_WITH_A_USER')
    })
  })

  describe('POST /users/change-password', () => {
    it('changes password successfully', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      const newPassword = 'Password321!@#'
      const response = await api.post(
        '/users/change-password',
        { new_password: newPassword, old_password: context.password.password },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      context.password.password = newPassword
    })

    it('returns error when new password matches old password', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      let error

      try {
        await api.post(
          '/users/change-password',
          { new_password: context.password.password, old_password: context.password.password },
          { headers: { Authorization: tokens.access_token } }
        )
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('NEW_PASSWORD_IS_SAME_AS_OLD_PASSWORD')
    })
  })

  describe('POST /users/set-user-password', () => {
    let adminHeaders

    before(async () => {
      const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
      adminHeaders = { headers: { Authorization: tokens.access_token } }
    })

    it('sets user password by admin successfully', async () => {
      const response = await api.post(
        '/users/set-user-password',
        { password: 'AdminReset123!@#', user_id: context.adminManaged.id },
        adminHeaders
      )

      expect(response.status).to.equal(200)
      context.adminManaged.password = 'AdminReset123!@#'
    })

    it('returns error when password is missing', async () => {
      let error

      try {
        await api.post('/users/set-user-password', { user_id: context.adminManaged.id }, adminHeaders)
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_PASSWORD')
    })
  })

  describe('POST /users/forgot-password', () => {
    it('triggers forgot password successfully', async () => {
      const response = await api.post('/users/forgot-password', { email: context.forgot.email })

      expect(response.status).to.equal(200)
      context.forgot.tokenDoc = await waitForVerificationToken({
        email: context.forgot.email,
        type: 'forgot_password'
      })
    })

    it('returns error when user is not found', async () => {
      let error

      try {
        await api.post('/users/forgot-password', { email: 'missing-user@example.com' })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('USER_DOES_NOT_EXIST')
    })
  })

  describe('POST /users/retry-forgot-password', () => {
    it('retries forgot password successfully', async () => {
      const response = await api.post('/users/retry-forgot-password', { email: context.forgot.email })

      expect(response.status).to.equal(200)
      context.forgot.tokenDoc = await waitForVerificationToken({
        email: context.forgot.email,
        type: 'forgot_password'
      })
    })

    it('returns error when user is not found', async () => {
      let error

      try {
        await api.post('/users/retry-forgot-password', { email: 'missing-user@example.com' })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('USER_DOES_NOT_EXIST')
    })
  })

  describe('POST /users/verify-forgot-password-code', () => {
    it('verifies forgot password code successfully', async () => {
      const response = await api.post('/users/verify-forgot-password-code', {
        email: context.forgot.email,
        token: context.forgot.tokenDoc.token
      })

      expect(response.status).to.equal(200)
      expect(response.data.data).to.deep.equal({ message: 'OTP_IS_VALID', success: true })
    })

    it('returns error for invalid forgot password code', async () => {
      let error

      try {
        await api.post('/users/verify-forgot-password-code', {
          email: context.forgot.email,
          token: 'invalid-token'
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('OTP_IS_NOT_VALID')
    })
  })

  describe('POST /users/verify-forgot-password', () => {
    it('resets password successfully using forgot password token', async () => {
      const newPassword = 'Forgot321!@#'
      const response = await api.post('/users/verify-forgot-password', {
        email: context.forgot.email,
        password: newPassword,
        token: context.forgot.tokenDoc.token
      })

      expect(response.status).to.equal(200)
      context.forgot.password = newPassword
    })

    it('returns error when token is used again', async () => {
      let error

      try {
        await api.post('/users/verify-forgot-password', {
          email: context.forgot.email,
          password: 'AnotherPass123!@#',
          token: context.forgot.tokenDoc.token
        })
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('OTP_IS_NOT_VALID')
    })
  })

  describe('POST /users/verify-user-password', () => {
    it('validates user password successfully', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      const response = await api.post(
        '/users/verify-user-password',
        { password: context.password.password },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.data).to.deep.equal({ message: 'PASSWORD_IS_CORRECT', success: true })
    })

    it('returns incorrect result when password does not match', async () => {
      const tokens = await loginAndGetTokens({ email: context.password.email, password: context.password.password })
      const response = await api.post(
        '/users/verify-user-password',
        { password: 'WrongPassword1!' },
        { headers: { Authorization: tokens.access_token } }
      )

      expect(response.status).to.equal(200)
      expect(response.data.data).to.deep.equal({ message: 'PASSWORD_IS_INCORRECT', success: false })
    })
  })

  describe('POST /users/refresh-token', () => {
    it('refreshes tokens when payload is valid', async () => {
      const tokens = await loginAndGetTokens({ email: 'test@user.com', password: '123456aA@' })
      const response = await api.post('/users/refresh-token', tokens)

      expect(response.status).to.equal(200)
      expect(response.data.data.access_token).to.be.a('string')
      expect(response.data.data.refresh_token).to.be.a('string')
    })

    it('returns error when tokens are missing', async () => {
      let error

      try {
        await api.post('/users/refresh-token', {})
      } catch (err) {
        error = err
      }

      expect(error?.response?.status).to.equal(500)
      expect(error?.response?.data?.message).to.equal('MISSING_ACCESS_TOKEN_AND_REFRESH_TOKEN')
    })
  })
})
