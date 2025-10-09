class CustomError extends Error {
  constructor(statusCode, message) {
    super(statusCode)
    this.statusCode = statusCode
    this.message = message
  }
}

export { CustomError }
