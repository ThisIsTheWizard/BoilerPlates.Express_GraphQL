import { pick } from 'lodash'
import { parse } from 'qs'

// Helpers
import { commonHelper, roleHelper } from 'src/modules/helpers'

// Services
import { roleService } from 'src/modules/services'

// Utils
import { useTransaction } from 'src/utils/database'

export const roleController = {}

roleController.createARole = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleService.createARoleForMutation(req.body, req.user, transaction)
    )

    res.status(201).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.updateARole = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleService.updateARoleForMutation({ entity_id: req.params.entity_id, data: req.body }, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.deleteARole = async (req, res, next) => {
  try {
    const data = await useTransaction(async (transaction) =>
      roleService.deleteARoleForMutation(req.params, transaction)
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.getRoles = async (req, res, next) => {
  try {
    const query = parse(req.query)
    const options = commonHelper.getOptionsFromQuery(query)
    const data = await roleHelper.getRolesForQuery(
      pick(query, ['exclude_entity_ids', 'include_entity_ids', 'name']),
      options,
      req.user
    )

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}

roleController.getARole = async (req, res, next) => {
  try {
    const data = await roleHelper.getARoleForQuery(req.params, req.user)

    res.status(200).json({ data, message: 'SUCCESS' })
  } catch (error) {
    next(error)
  }
}
