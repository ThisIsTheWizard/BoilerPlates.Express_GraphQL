import { Router } from 'express'

// Controllers
import { rolePermissionController } from 'src/modules/controllers'

// Middlewares
import { authorizer } from 'src/middlewares'

export const rolePermissionRouter = Router()

/**
 * @swagger
 * /role-permissions:
 *   post:
 *     tags:
 *       - Role Permissions
 *     summary: Create a new role permission
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
 *               permission_id:
 *                 type: string
 *                 format: uuid
 *               can_do_the_action:
 *                 type: boolean
 *             required:
 *               - role_id
 *               - permission_id
 *               - can_do_the_action
 *     responses:
 *       201:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.post('/', authorizer(['admin', 'developer']), rolePermissionController.createARolePermission)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   put:
 *     tags:
 *       - Role Permissions
 *     summary: Update role permission by ID
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
 *               can_do_the_action:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SUCCESS
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.put(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.updateARolePermission
)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   delete:
 *     tags:
 *       - Role Permissions
 *     summary: Delete role permission by ID
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
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.delete(
  '/:entity_id',
  authorizer(['admin', 'developer']),
  rolePermissionController.deleteARolePermission
)

/**
 * @swagger
 * /role-permissions:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get all role permissions
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
 *         name: permission_id
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: can_do_the_action
 *         schema:
 *           type: boolean
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
 *                 $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.get('/', authorizer(['admin', 'developer']), rolePermissionController.getRolePermissions)

/**
 * @swagger
 * /role-permissions/{entity_id}:
 *   get:
 *     tags:
 *       - Role Permissions
 *     summary: Get role permission by ID
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
 *               $ref: '#/components/schemas/RolePermission'
 */
rolePermissionRouter.get('/:entity_id', authorizer(['admin', 'developer']), rolePermissionController.getARolePermission)
