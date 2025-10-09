import { Router } from 'express'

// Controllers
import { userController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const userRouter = Router()

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: SUCCESS
 */
userRouter.post('/register', userController.registerUser)

/**
 * @swagger
 * /users/verify-user-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *             required:
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/verify-user-email', userController.verifyUserEmail)

/**
 * @swagger
 * /users/resend-verification-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Resend verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/resend-verification-email', userController.resendVerificationEmail)

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/login', userController.loginUser)

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh user token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               access_token:
 *                 type: string
 *               refresh_token:
 *                 type: string
 *             required:
 *               - access_token
 *               - refresh_token
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/refresh-token', userController.getRefreshedTokens)

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get authenticated user
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.get('/me', authorizer(), userController.getAuthUser)

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Logout user
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/logout', authorizer(), userController.logoutUser)

/**
 * @swagger
 * /users/change-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Change user email
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/change-email', authorizer(), userController.changeEmail)

/**
 * @swagger
 * /users/cancel-change-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Cancel email change
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/cancel-change-email', authorizer(), userController.cancelChangeEmail)

/**
 * @swagger
 * /users/verify-change-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify new email
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *             required:
 *               - token
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/verify-change-email', authorizer(), userController.verifyNewEmail)

/**
 * @swagger
 * /users/set-user-email:
 *   post:
 *     tags:
 *       - Users
 *     summary: Set user email by admin
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_email:
 *                 type: string
 *                 format: email
 *               user_id:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - new_email
 *               - user_id
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/set-user-email', authorizer(['admin']), userController.setUserEmailByAdmin)

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Change user password
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               old_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *             required:
 *               - old_password
 *               - new_password
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/change-password', authorizer(), userController.changePassword)

/**
 * @swagger
 * /users/set-user-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Set user password by admin
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               password:
 *                 type: string
 *             required:
 *               - user_id
 *               - password
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/set-user-password', authorizer(['admin']), userController.setUserPasswordByAdmin)

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Forgot password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/forgot-password', userController.tryForgotPassword)

/**
 * @swagger
 * /users/retry-forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Retry forgot password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/retry-forgot-password', userController.retryForgotPassword)

/**
 * @swagger
 * /users/verify-forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify forgot password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               token:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *               - token
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/verify-forgot-password', userController.verifyForgotPassword)

/**
 * @swagger
 * /users/verify-forgot-password-code:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify forgot password code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *             required:
 *               - email
 *               - token
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/verify-forgot-password-code', userController.verifyForgotPasswordCode)

/**
 * @swagger
 * /users/verify-user-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify user password
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: SUCCESS
 */
userRouter.post('/verify-user-password', authorizer(), userController.verifyUserPassword)
