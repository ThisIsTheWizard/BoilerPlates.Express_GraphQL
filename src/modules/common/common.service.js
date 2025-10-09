import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Helpers
import { commonHelper } from 'src/modules/helpers'

export const compareHashPassword = (str = '', hashStr) => {
  if (!str || !hashStr) return false

  return bcrypt.compareSync(str, hashStr)
}

export const checkOldPasswords = (new_password, oldPasswords = []) => {
  let isOldPasswordMatched = false
  for (const password of oldPasswords) {
    if (compareHashPassword(new_password, password)) {
      isOldPasswordMatched = true
    }
  }
  return isOldPasswordMatched
}

export const generateHashPassword = (str = '') => bcrypt.hashSync(str, 10)

export const generateJWTToken = (payload = {}, expiresIn = '1h') =>
  jwt.sign(
    {
      iss: process.env.JWT_ISSUER,
      sub: payload?.sub || commonHelper.getRandomString(17),
      aud: payload?.aud || commonHelper.getRandomString(17),
      jti: payload?.jti || commonHelper.getRandomString(17),
      ...payload
    },
    process.env.JWT_SECRET,
    { expiresIn }
  )

export const decodeJWTToken = (token) => jwt.decode(token)

export const verifyJWTToken = (token) => {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    return { message: 'TOKEN_IS_VERIFIED', payload, success: true }
  } catch (err) {
    return {
      message: err?.message?.replaceAll(' ', '_')?.toUpperCase?.(),
      success: false
    }
  }
}
