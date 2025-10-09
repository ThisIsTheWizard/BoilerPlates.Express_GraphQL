import { find, forEach, isBoolean, isEmpty, isNumber, join, map, omit, size } from 'lodash'
import validator from 'validator'

// Helper
import {} from 'src/modules/helpers'

// Utils
import { CustomError } from 'src/utils/error'

export const getCommonOptions = () => ({ limit: 50, offset: 0, order: [['created_at', 'desc']] })

export const getFirstLetterUpperCase = (str) => {
  if (!size(str)) return ''

  return str?.charAt?.(0)?.toUpperCase?.() + str?.slice?.(1)
}

export const getOptionsFromQuery = (query = {}) => {
  const options = { limit: 50, offset: 0, order: [['created_at', 'desc']] }
  if (query?.limit) options.limit = Number(query.limit)
  if (query?.offset) options.offset = Number(query.offset)
  if (size(query?.order)) {
    options.order = JSON.parse(query.order)
  }

  return options
}

export const getRandomNumber = (length) => {
  const characters = '0123456789'

  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export const getRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*(){}[]'

  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }

  return result
}

export const validateDomain = (domain = '') => validator.isFQDN(domain)

export const validateEmail = (email = '') => validator.isEmail(email)

export const validateProps = (fields = [], body = {}) => {
  const notAllowedFields = Object.keys(omit(body, map(fields, 'field')))
  if (size(notAllowedFields)) {
    throw new Error(`${join(notAllowedFields, '_AND_')?.toUpperCase?.()}_NOT_ALLOWED`)
  }

  const invalidFields = []
  const missingFields = []
  forEach(fields, ({ field, required, type }) => {
    if (typeof body[field] !== 'undefined' && typeof body[field] !== type) {
      invalidFields.push(field)
    }
    if (required && !isBoolean(body[field]) && isEmpty(body[field])) {
      missingFields.push(field)
    }
  })

  if (size(invalidFields)) {
    throw new Error(`INVALID_TYPE_OF_${join(invalidFields, '_AND_')?.toUpperCase?.()}`)
  }
  if (size(missingFields)) {
    throw new Error(`MISSING_${join(missingFields, '_AND_')?.toUpperCase?.()}`)
  }
}

export const validateRequiredProps = (requiredFields = [], body = {}) => {
  const missingFields = []
  for (let i = 0; i < requiredFields?.length; i++) {
    const field = requiredFields[i]

    if (isEmpty(body[field]) && !isNumber(body[field]) && !isBoolean(body[field])) {
      missingFields.push(field)
    }
  }

  if (size(missingFields)) {
    throw new CustomError(400, `MISSING_${join(missingFields, '_AND_')?.toUpperCase?.()}`)
  }
}

export const validateURL = (input = '') => validator.isURL(input)

export const validateUUID = (uuid = '') => validator.isUUID(uuid)

export const validatePassword = (password) =>
  validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })

export const validatePhoneNumber = (phoneNumber = '') => validator.isMobilePhone(phoneNumber)

export const validateUserPermission = ({ action, module, permissions = {} } = {}) => {
  const permission = find(permissions?.[module] || [], (perm) => perm?.action === action)
  return !!permission?.can_do_the_action
}
