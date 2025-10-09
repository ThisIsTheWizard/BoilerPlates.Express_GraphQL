import { Router } from 'express'

// Controllers
import { permissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const permissionRouter = Router()

/**
 * @swagger
 * /permissions:
 *   post:
 *     tags:
 *       - Permissions
 *     summary: Create a new permission
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *               module:
 *                 type: string
 *                 enum: [permission, role, role_permission, role_user, user]
 *             required:
 *               - action
 *               - module
 *     responses:
 *       201:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.post('/', authorizer(['admin', 'developer']), permissionController.createAPermission)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   put:
 *     tags:
 *       - Permissions
 *     summary: Update permission by ID
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
 *               action:
 *                 type: string
 *                 enum: [create, read, update, delete]
 *               module:
 *                 type: string
 *                 enum: [permission, role, role_permission, role_user, user]
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.put('/:entity_id', authorizer(['admin', 'developer']), permissionController.updateAPermission)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   delete:
 *     tags:
 *       - Permissions
 *     summary: Delete permission by ID
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
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.delete('/:entity_id', authorizer(['admin', 'developer']), permissionController.deleteAPermission)

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get all permissions
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
 *           enum: [action, module, created_at, updated_at]
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, read, update, delete]
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           enum: [permission, role, role_permission, role_user, user]
 *       - in: query
 *         name: exclude_entity_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *       - in: query
 *         name: include_entity_ids
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */
permissionRouter.get('/', authorizer(['admin', 'developer']), permissionController.getPermissions)

/**
 * @swagger
 * /permissions/{entity_id}:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permission by ID
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
 *               $ref: '#/components/schemas/Permission'
 */
permissionRouter.get('/:entity_id', authorizer(['admin', 'developer']), permissionController.getAPermission)
