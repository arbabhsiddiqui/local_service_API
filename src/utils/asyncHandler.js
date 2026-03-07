const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        // ApiError uses `statusCode` property rather than `code`, so
        // fall back appropriately. log the error stack in development
        const status = error.statusCode || error.code || 500
        res.status(status).json({
            success: false,
            message: error.message || "Internal Server Error",
            // include any structured error data if available
            ...(error.errors && { errors: error.errors })
        })
    }
}

export { asyncHandler }