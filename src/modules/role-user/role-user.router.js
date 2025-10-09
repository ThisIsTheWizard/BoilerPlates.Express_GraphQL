import { Router } from 'express'

// Controllers
import { roleUserController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const roleUserRouter = Router()

/**
 * @swagger
 * /role-users:
 *   post:
 *     tags:
 *       - Role Users
 *     summary: Create a new role user
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - role_id
 *               - user_id
 *     responses:
 *       201:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.post('/', authorizer(['admin', 'developer']), roleUserController.createARoleUser)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   put:
 *     tags:
 *       - Role Users
 *     summary: Update role user by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.put('/:entity_id', authorizer(['admin', 'developer']), roleUserController.updateARoleUser)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   delete:
 *     tags:
 *       - Role Users
 *     summary: Delete role user by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.delete('/:entity_id', authorizer(['admin', 'developer']), roleUserController.deleteARoleUser)

/**
 * @swagger
 * /role-users:
 *   get:
 *     tags:
 *       - Role Users
 *     summary: Get all role users
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, updated_at]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.get('/', authorizer(['admin', 'developer']), roleUserController.getRoleUsers)

/**
 * @swagger
 * /role-users/{entity_id}:
 *   get:
 *     tags:
 *       - Role Users
 *     summary: Get role user by ID
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: entity_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleUser'
 */
roleUserRouter.get('/:entity_id', authorizer(['admin', 'developer']), roleUserController.getARoleUser)
