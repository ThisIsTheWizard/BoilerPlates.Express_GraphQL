const formatErrorMessage = (str) => {
  const message = str?.replaceAll?.(' ', '_')

  return message?.toUpperCase?.()
}

// eslint-disable-next-line max-params
export const error = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  return res.status(error?.statusCode || 500).json({ message: formatErrorMessage(error?.message || 'SERVER_ERROR') })
}
