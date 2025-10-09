import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, permissionHelper } from 'src/modules/helpers'

// Services
import { permissionService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'

export const permissionController = {}

permissionController.createAPermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      permissionService.createAPermissionForMutation(req.body, req.user, transaction)
    )

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

permissionController.updateAPermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      permissionService.updateAPermissionForMutation({ entity_id: req.params.entity_id, data: req.body }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

permissionController.deleteAPermission = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      permissionService.deleteAPermissionForMutation(req.params, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

permissionController.getPermissions = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await permissionHelper.getPermissionsForQuery(
      pick(query, ['action', 'exclude_entity_ids', 'include_entity_ids', 'module']),
      options,
      req.user
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

permissionController.getAPermission = async (req, res, next) => {
  try {
    const data = await permissionHelper.getAPermissionForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}
