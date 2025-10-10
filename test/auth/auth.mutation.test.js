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
})
