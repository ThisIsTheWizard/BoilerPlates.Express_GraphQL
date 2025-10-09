/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *           enum: [create, read, update, delete]
 *         module:
 *           type: string
 *           enum: [permission, role, role_permission, role_user, user]
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           enum: [admin, developer, moderator, user]
 *         created_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RolePermission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role_id:
 *           type: string
 *           format: uuid
 *         permission_id:
 *           type: string
 *           format: uuid
 *         can_do_the_action:
 *           type: boolean
 *         created_by:
 *           type: string
 *           format: uuid
 *         updated_by:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RoleUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role_id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         phone_number:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, invited, unverified]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
