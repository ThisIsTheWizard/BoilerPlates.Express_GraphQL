// Services
import { userService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'
import { CustomError } from 'src/utils/error'

export const userController = {}

userController.registerUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.registerUser(req.body, transaction))

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => await userService.verifyUserEmail(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.resendVerificationEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.resendUserVerificationEmail(req.body, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.loginUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.loginUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getRefreshedTokens = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.refreshTokensForUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.getAuthUser = async (req, res, next) => {
  try {
    if (!req?.user?.user_id) {
      throw new CustomError(401, 'UNAUTHORIZED')
    }

    res.status(200).json({ data: req.user, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.logoutUser = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.logoutAUser({ token: req.headers?.authorization, type: 'access_token' }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.changeEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.changeEmailByUser({ new_email: req.body?.email, user_id: req?.user?.user_id }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.cancelChangeEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.cancelChangeEmailByUser(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyNewEmail = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.verifyChangeEmailByUser({ token: req.body?.token, user_id: req?.user?.user_id }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.setUserEmailByAdmin = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.setUserEmailByAdmin(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.changePassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.changePasswordByUser(
        {
          new_password: req.body?.new_password,
          old_password: req.body?.old_password,
          user_id: req?.user?.user_id
        },
        transaction
      )
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.setUserPasswordByAdmin = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.changePasswordByAdmin(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.tryForgotPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.forgotPassword(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.retryForgotPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.retryForgotPassword(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) => userService.verifyForgotPassword(req.body, transaction))

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyForgotPasswordCode = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.verifyForgotPasswordCode(req.body, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}

userController.verifyUserPassword = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      userService.verifyUserPassword({ password: req.body?.password, user_id: req?.user?.user_id }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (err) {
    next(err)
  }
}
